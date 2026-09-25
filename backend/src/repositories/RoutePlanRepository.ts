import { seed } from "../seed";
import type { RoutePlan } from "../models/RoutePlan";

// 内存数据源：工单通过会抬升路线风险、关闭时回退，需要可变状态。
const rows: RoutePlan[] = seed.routePlan.map((row) => ({ ...row, facility_ids: [...row.facility_ids] }));

export const routePlanRepository = {
  findAll: (): RoutePlan[] => rows.map((row) => ({ ...row, facility_ids: [...row.facility_ids] })),
  findById: (id: number): RoutePlan | undefined => rows.find((row) => row.id === id),
  findByFacilityId: (facilityId: number): RoutePlan[] =>
    rows.filter((row) => row.facility_ids.includes(facilityId)),
  save: (row: RoutePlan): RoutePlan => {
    const index = rows.findIndex((item) => item.id === row.id);
    const stored = { ...row, facility_ids: [...row.facility_ids] };
    if (index >= 0) rows[index] = stored;
    else rows.push(stored);
    return { ...stored };
  }
};
