import type { BarrierReport } from "../models/BarrierReport";
import type { AccessibleFacility } from "../models/AccessibleFacility";
import type { RoutePlan } from "../models/RoutePlan";
import type { BarrierReportReviewPayload } from "../types/BarrierReportReviewPayload";
import { ServiceError } from "./serviceError";

/**
 * 障碍工单审核流程（纯函数，方便 service 与测试复用）。
 *
 * 不变量：
 * - approve：PENDING 才生效；设施停用（BLOCKED），包含该设施的路线风险升到 HIGH。
 * - reject：仅 PENDING -> REJECTED，不触碰设施/路线。
 * - close：PENDING -> CLOSED 不产生影响；APPROVED -> CLOSED 只回退这张工单造成的影响。
 * - 已处理（APPROVED/REJECTED/CLOSED）的工单重复处理时原状态返回，设施与路线不再变化。
 * - 回退设施时若当前为巡检刚标记的 MAINTENANCE，则保持维修不覆盖。
 */

export type ReviewInput = BarrierReportReviewPayload & { reviewer: string };

export type ReviewCollections = {
  reports: BarrierReport[];
  facilities: AccessibleFacility[];
  routes: RoutePlan[];
};

export type ReviewResult = {
  report: BarrierReport;
  facilities: AccessibleFacility[];
  routes: RoutePlan[];
  changed: boolean;
};

const ACTIONS = ["approve", "reject", "close"] as const;

const cloneCollections = (collections: ReviewCollections): ReviewCollections => ({
  reports: collections.reports.map((row) => ({ ...row })),
  facilities: collections.facilities.map((row) => ({ ...row })),
  routes: collections.routes.map((row) => ({ ...row, facility_ids: [...row.facility_ids] }))
});

/** 仍处于“通过且未关闭”状态、会持续压制设施/路线的工单。 */
const hasOtherActiveApproval = (
  reports: BarrierReport[],
  facilityId: number,
  selfId: number
): boolean =>
  reports.some(
    (row) =>
      row.id !== selfId && row.facility_id === facilityId && row.verify_status === "APPROVED"
  );

export function reviewBarrierReport(
  reportId: number,
  input: ReviewInput,
  collections: ReviewCollections
): ReviewResult {
  const action = input.action;
  if (!ACTIONS.includes(action)) {
    throw new ServiceError("REPORT_ACTION_INVALID", 400);
  }

  const work = cloneCollections(collections);
  const report = work.reports.find((row) => row.id === reportId);
  if (!report) {
    throw new ServiceError("REPORT_NOT_FOUND", 404);
  }

  // 幂等：同一工单重复处理，直接返回当前状态与处理人，设施/路线不再变化。
  if (report.verify_status !== "PENDING") {
    return {
      report: { ...report },
      facilities: collections.facilities.map((row) => ({ ...row })),
      routes: collections.routes.map((row) => ({ ...row, facility_ids: [...row.facility_ids] })),
      changed: false
    };
  }

  const now = new Date().toISOString();
  const facility = work.facilities.find((row) => row.id === report.facility_id);
  if (!facility) {
    throw new ServiceError("FACILITY_NOT_FOUND", 404);
  }

  const affectedRoutes = work.routes.filter((row) =>
    row.facility_ids.includes(facility.id)
  );

  if (action === "reject") {
    report.verify_status = "REJECTED";
    report.reviewer = input.reviewer;
    report.reviewed_at = now;
    report.review_note = input.review_note ?? "";
    report.affected_route_ids = [];
    return {
      report: { ...report },
      facilities: work.facilities,
      routes: work.routes,
      changed: true
    };
  }

  if (action === "close") {
    // 待审直接关闭：从未产生过影响，无需回退。
    report.verify_status = "CLOSED";
    report.reviewer = input.reviewer;
    report.reviewed_at = now;
    report.review_note = input.review_note ?? "";
    report.affected_route_ids = [];
    return {
      report: { ...report },
      facilities: work.facilities,
      routes: work.routes,
      changed: true
    };
  }

  // approve：停用设施，风险升级。
  if (facility.base_status === undefined) {
    facility.base_status = facility.status;
  }
  facility.status = "BLOCKED";

  for (const route of affectedRoutes) {
    if (route.base_risk_level === undefined) {
      route.base_risk_level = route.risk_level;
    }
    route.risk_level = "HIGH";
  }

  report.verify_status = "APPROVED";
  report.reviewer = input.reviewer;
  report.reviewed_at = now;
  report.review_note = input.review_note ?? "";
  report.affected_route_ids = affectedRoutes.map((row) => row.id);

  return {
    report: { ...report },
    facilities: work.facilities,
    routes: work.routes,
    changed: true
  };
}

/**
 * 关闭一张“已通过”工单时的回退逻辑：
 * 只回退这张工单造成的影响 —— 若同一设施没有其他有效通过工单，
 * 设施恢复基线状态（MAINTENANCE 是巡检独立标记，保持维修），路线恢复基线风险。
 */
export function rollbackApprovedReport(
  reportId: number,
  input: ReviewInput,
  collections: ReviewCollections
): ReviewResult {
  const work = cloneCollections(collections);
  const report = work.reports.find((row) => row.id === reportId);
  if (!report) {
    throw new ServiceError("REPORT_NOT_FOUND", 404);
  }
  if (report.verify_status !== "APPROVED") {
    return {
      report: { ...report },
      facilities: collections.facilities.map((row) => ({ ...row })),
      routes: collections.routes.map((row) => ({ ...row, facility_ids: [...row.facility_ids] })),
      changed: false
    };
  }

  const now = new Date().toISOString();
  const facility = work.facilities.find((row) => row.id === report.facility_id);
  if (!facility) {
    throw new ServiceError("FACILITY_NOT_FOUND", 404);
  }

  if (!hasOtherActiveApproval(work.reports, facility.id, report.id)) {
    // 没有其他通过工单压制该设施时才回退；巡检刚标记的维修状态保持不变。
    if (facility.status !== "MAINTENANCE") {
      facility.status = facility.base_status ?? facility.status;
    }
    facility.base_status = undefined;

    for (const route of work.routes.filter((row) => row.facility_ids.includes(facility.id))) {
      const stillBlocked = work.reports.some(
        (other) =>
          other.id !== report.id &&
          other.verify_status === "APPROVED" &&
          route.facility_ids.includes(other.facility_id)
      );
      if (!stillBlocked) {
        route.risk_level = route.base_risk_level ?? route.risk_level;
        route.base_risk_level = undefined;
      }
    }
  }

  report.verify_status = "CLOSED";
  report.reviewer = input.reviewer;
  report.reviewed_at = now;
  report.review_note = input.review_note ?? "";
  report.affected_route_ids = (report.affected_route_ids ?? []).filter(Boolean);

  return {
    report: { ...report },
    facilities: work.facilities,
    routes: work.routes,
    changed: true
  };
}
