import type { BarrierReport } from "../types/BarrierReport";
import type { AccessibleFacility } from "../types/AccessibleFacility";
import type { RoutePlan } from "../types/RoutePlan";
import type { ReviewBarrierReportPayload, ReviewBarrierReportResult } from "../types/ReviewBarrierReport";

/**
 * 障碍工单审核流程（纯函数，离线 mock 与后端使用同一套规则）。
 *
 * - approve：PENDING 才生效；设施停用（BLOCKED），包含该设施的路线风险升到 HIGH。
 * - reject：仅 PENDING -> REJECTED，不触碰设施/路线。
 * - close：PENDING -> CLOSED 不产生影响；APPROVED -> CLOSED 只回退这张工单造成的影响。
 * - 已处理工单重复提交：changed=false，返回当前状态与处理人，设施/路线不再变化。
 * - 回退设施时若当前是巡检刚标记的 MAINTENANCE，则保持维修。
 */

export type ReviewCollections = {
  reports: BarrierReport[];
  facilities: AccessibleFacility[];
  routes: RoutePlan[];
};

export class WorkflowError extends Error {
  code: string;
  status: number;
  report?: BarrierReport;

  constructor(code: string, status: number, report?: BarrierReport) {
    super(code);
    this.name = "WorkflowError";
    this.code = code;
    this.status = status;
    this.report = report;
  }
}

const cloneCollections = (collections: ReviewCollections): ReviewCollections => ({
  reports: collections.reports.map((row) => ({ ...row, affected_route_ids: [...(row.affected_route_ids ?? [])] })),
  facilities: collections.facilities.map((row) => ({ ...row })),
  routes: collections.routes.map((row) => ({ ...row, facility_ids: [...row.facility_ids] }))
});

const unchanged = (collections: ReviewCollections, report: BarrierReport): ReviewBarrierReportResult => ({
  report: { ...report },
  facilities: collections.facilities.map((row) => ({ ...row })),
  routes: collections.routes.map((row) => ({ ...row, facility_ids: [...row.facility_ids] })),
  changed: false
});

const hasOtherActiveApproval = (reports: BarrierReport[], facilityId: number, selfId: number) =>
  reports.some((row) => row.id !== selfId && row.facility_id === facilityId && row.verify_status === "APPROVED");

export function reviewBarrierReport(
  reportId: number,
  input: ReviewBarrierReportPayload & { reviewer: string },
  collections: ReviewCollections
): ReviewBarrierReportResult {
  if (!["approve", "reject", "close"].includes(input.action)) {
    throw new WorkflowError("REPORT_ACTION_INVALID", 400);
  }

  const work = cloneCollections(collections);
  const report = work.reports.find((row) => row.id === reportId);
  if (!report) {
    throw new WorkflowError("REPORT_NOT_FOUND", 404);
  }

  // 幂等：已处理工单重复处理，只回显当前状态与处理人。
  if (report.verify_status !== "PENDING") {
    return unchanged(collections, report);
  }

  const now = new Date().toISOString();
  const facility = work.facilities.find((row) => row.id === report.facility_id);
  if (!facility) {
    throw new WorkflowError("FACILITY_NOT_FOUND", 404);
  }

  const affectedRoutes = work.routes.filter((row) => row.facility_ids.includes(facility.id));

  if (input.action === "reject") {
    Object.assign(report, {
      verify_status: "REJECTED",
      reviewer: input.reviewer,
      reviewed_at: now,
      review_note: input.review_note ?? "",
      affected_route_ids: []
    });
    return { report: { ...report }, facilities: work.facilities, routes: work.routes, changed: true };
  }

  if (input.action === "close") {
    // 待审直接关闭：从未产生过影响，无需回退。
    Object.assign(report, {
      verify_status: "CLOSED",
      reviewer: input.reviewer,
      reviewed_at: now,
      review_note: input.review_note ?? "",
      affected_route_ids: []
    });
    return { report: { ...report }, facilities: work.facilities, routes: work.routes, changed: true };
  }

  // approve：停用设施（锁定基线状态一次），路线风险升到高（锁定基线风险一次）。
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

  Object.assign(report, {
    verify_status: "APPROVED",
    reviewer: input.reviewer,
    reviewed_at: now,
    review_note: input.review_note ?? "",
    affected_route_ids: affectedRoutes.map((row) => row.id)
  });

  return { report: { ...report }, facilities: work.facilities, routes: work.routes, changed: true };
}

/** 关闭已通过工单：只回退这张工单造成的影响。 */
export function rollbackApprovedReport(
  reportId: number,
  input: ReviewBarrierReportPayload & { reviewer: string },
  collections: ReviewCollections
): ReviewBarrierReportResult {
  const work = cloneCollections(collections);
  const report = work.reports.find((row) => row.id === reportId);
  if (!report) {
    throw new WorkflowError("REPORT_NOT_FOUND", 404);
  }
  if (report.verify_status !== "APPROVED") {
    return unchanged(collections, report);
  }

  const now = new Date().toISOString();
  const facility = work.facilities.find((row) => row.id === report.facility_id);
  if (!facility) {
    throw new WorkflowError("FACILITY_NOT_FOUND", 404);
  }

  if (!hasOtherActiveApproval(work.reports, facility.id, report.id)) {
    // 巡检刚标记为维修的设施保持维修，不被工单回退覆盖。
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

  Object.assign(report, {
    verify_status: "CLOSED",
    reviewer: input.reviewer,
    reviewed_at: now,
    review_note: input.review_note ?? ""
  });

  return { report: { ...report }, facilities: work.facilities, routes: work.routes, changed: true };
}
