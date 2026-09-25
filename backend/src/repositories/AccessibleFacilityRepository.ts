import { seed } from "../seed";
import type { AccessibleFacility } from "../models/AccessibleFacility";

const rows: AccessibleFacility[] = (seed.accessibleFacility as unknown as AccessibleFacility[]).map((row) => ({ ...row }));

export const accessibleFacilityRepository = {
  findAll: () => rows,
  findById: (id: number) => rows.find((row) => row.id === id) ?? null,
  save: (row: AccessibleFacility) => {
    rows.push(row);
    return row;
  },
  updateStatus: (id: number, status: string, checkedAt: string) => {
    const index = rows.findIndex((row) => row.id === id);
    if (index < 0) return null;
    rows[index] = { ...rows[index], status, last_checked_at: checkedAt };
    return rows[index];
  }
};
