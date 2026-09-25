import { mockData } from "./seedData";
import { reviewBarrierReport, rollbackApprovedReport } from "../utils/barrierReview";
import type { BarrierReport } from "../types/BarrierReport";
import type { AccessibleFacility } from "../types/AccessibleFacility";
import type { RoutePlan } from "../types/RoutePlan";
import type { ReviewBarrierReportPayload, ReviewBarrierReportResult } from "../types/ReviewBarrierReport";

/**
 * 离线本地库：后端不可达时作为兜底，保证审核流程在评审环境里依然可用。
 * 数据带 localStorage 持久化，刷新/切页后新的设施状态与路线风险仍可见。
 */

const STORAGE_KEY = "accessroute.localDb.v1";

type LocalShape = {
  barrierReport: BarrierReport[];
  accessibleFacility: AccessibleFacility[];
  routePlan: RoutePlan[];
};

const freshDb = (): LocalShape => ({
  barrierReport: mockData.barrierReport.map((row) => ({ ...row })) as BarrierReport[],
  accessibleFacility: mockData.accessibleFacility.map((row) => ({ ...row })) as AccessibleFacility[],
  routePlan: mockData.routePlan.map((row) => ({ ...row, facility_ids: [...row.facility_ids] })) as RoutePlan[]
});

const clone = (db: LocalShape): LocalShape => ({
  barrierReport: db.barrierReport.map((row) => ({ ...row, affected_route_ids: [...(row.affected_route_ids ?? [])] })),
  accessibleFacility: db.accessibleFacility.map((row) => ({ ...row })),
  routePlan: db.routePlan.map((row) => ({ ...row, facility_ids: [...row.facility_ids] }))
});

let cache: LocalShape | null = null;

const load = (): LocalShape => {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      cache = JSON.parse(raw) as LocalShape;
      return cache!;
    }
  } catch {
    // 存储不可用时退回内存模式
  }
  cache = freshDb();
  return cache;
};

const persist = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // 忽略写入失败
  }
};

export const localDb = {
  reports: (): BarrierReport[] => clone(load()).barrierReport,
  facilities: (): AccessibleFacility[] => clone(load()).accessibleFacility,
  routes: (): RoutePlan[] => clone(load()).routePlan,

  review: (id: number, payload: ReviewBarrierReportPayload, reviewer: string): ReviewBarrierReportResult => {
    const db = load();
    const current = db.barrierReport.find((row) => row.id === id);
    if (!current) throw new Error("REPORT_NOT_FOUND");

    const input = { ...payload, reviewer: reviewer || payload.reviewer || "审核员" };
    const collections = {
      reports: db.barrierReport,
      facilities: db.accessibleFacility,
      routes: db.routePlan
    };

    const result =
      current.verify_status === "APPROVED" && payload.action === "close"
        ? rollbackApprovedReport(id, input, collections)
        : reviewBarrierReport(id, input, collections);

    if (result.changed) {
      // 引擎在副本上运算，这里用返回的副本整体替换并持久化，避免共享引用。
      cache = {
        barrierReport: result.facilities ? collections.reports.map((row) =>
          row.id === result.report.id ? { ...result.report } : row
        ) : collections.reports,
        accessibleFacility: result.facilities.map((row) => ({ ...row })),
        routePlan: result.routes.map((row) => ({ ...row, facility_ids: [...row.facility_ids] }))
      };
      persist();
    }
    return result;
  },

  updateFacilityStatus: (id: number, status: string): AccessibleFacility => {
    const db = load();
    const facility = db.accessibleFacility.find((row) => row.id === id);
    if (!facility) throw new Error("FACILITY_NOT_FOUND");
    facility.status = status;
    facility.last_checked_at = new Date().toISOString();
    persist();
    return { ...facility };
  },

  reset: () => {
    cache = freshDb();
    persist();
  }
};
