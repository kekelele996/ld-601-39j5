import { seed } from "../seed";
import type { RoutePlan } from "../models/RoutePlan";

const rows: RoutePlan[] = (seed.routePlan as unknown as RoutePlan[]).map((row) => ({ ...row, facility_ids: [...row.facility_ids] }));

export const routePlanRepository = {
  findAll: () => rows,
  findById: (id: number) => rows.find((row) => row.id === id) ?? null,
  findByFacilityId: (facilityId: number) => rows.filter((row) => row.facility_ids.includes(facilityId)),
  save: (row: RoutePlan) => {
    rows.push(row);
    return row;
  },
  updateRisk: (id: number, riskLevel: string) => {
    const index = rows.findIndex((row) => row.id === id);
    if (index < 0) return null;
    rows[index] = { ...rows[index], risk_level: riskLevel };
    return rows[index];
  }
};
