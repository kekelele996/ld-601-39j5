import { seed } from "../seed";
import type { AccessibleFacility } from "../models/AccessibleFacility";

// 内存数据源：工单通过会停用设施、关闭时回退，需要可变状态。
const rows: AccessibleFacility[] = seed.accessibleFacility.map((row) => ({ ...row }));

export const accessibleFacilityRepository = {
  findAll: (): AccessibleFacility[] => rows.map((row) => ({ ...row })),
  findById: (id: number): AccessibleFacility | undefined => rows.find((row) => row.id === id),
  save: (row: AccessibleFacility): AccessibleFacility => {
    const index = rows.findIndex((item) => item.id === row.id);
    if (index >= 0) rows[index] = { ...row };
    else rows.push({ ...row });
    return { ...row };
  }
};
