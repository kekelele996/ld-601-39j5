import { useMemo, useState } from "react";
import type { RoutePlan } from "../types/RoutePlan";
import type { AccessibleFacility } from "../types/AccessibleFacility";
import type { BarrierReport } from "../types/BarrierReport";

export type RouteRiskView = {
  route: RoutePlan;
  /** 当前风险（工单通过后已被抬升为 HIGH） */
  riskLevel: string;
  /** 该路线上当前停用的设施名称 */
  blockedFacilityNames: string[];
  /** 该路线上处于维修的设施名称 */
  maintenanceFacilityNames: string[];
  /** 是否有通过且未关闭的工单压制这条路线 */
  hasOpenBarrier: boolean;
};

/**
 * 汇总路线风险：结合路线自身 risk_level、设施状态与“通过未关闭”的工单，
 * 让路线页切回来时仍能看到新的风险等级和受影响设施。
 */
export function useRouteRisk(
  routes: RoutePlan[] = [],
  facilities: AccessibleFacility[] = [],
  reports: BarrierReport[] = []
): { views: RouteRiskView[]; highRiskCount: number } {
  const views = useMemo<RouteRiskView[]>(() => {
    const facilityMap = new Map(facilities.map((row) => [row.id, row]));
    const activeReportFacilityIds = new Set(
      reports.filter((row) => row.verify_status === "APPROVED").map((row) => row.facility_id)
    );

    return routes.map((route) => {
      const routeFacilities = route.facility_ids
        .map((id) => facilityMap.get(id))
        .filter((row): row is AccessibleFacility => Boolean(row));

      const blockedFacilityNames = routeFacilities
        .filter((row) => row.status === "BLOCKED" || activeReportFacilityIds.has(row.id))
        .map((row) => row.name);
      const maintenanceFacilityNames = routeFacilities
        .filter((row) => row.status === "MAINTENANCE")
        .map((row) => row.name);
      const hasOpenBarrier = route.facility_ids.some((id) => activeReportFacilityIds.has(id));

      // 服务端已在通过时把 risk_level 改为 HIGH，这里以数据为准并兜底重算。
      const riskLevel =
        route.risk_level === "HIGH" || hasOpenBarrier ? "HIGH" : route.risk_level;

      return {
        route,
        riskLevel,
        blockedFacilityNames,
        maintenanceFacilityNames,
        hasOpenBarrier
      };
    });
  }, [routes, facilities, reports]);

  const highRiskCount = useMemo(
    () => views.filter((view) => view.riskLevel === "HIGH").length,
    [views]
  );

  return { views, highRiskCount };
}

/** 兼容简单列表场景的分页视图。 */
export function useRouteRiskPage<T>(rows: T[] = []) {
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const pageRows = useMemo(() => rows.slice((page - 1) * pageSize, page * pageSize), [rows, page]);
  return { page, setPage, pageSize, pageRows, total: rows.length };
}
