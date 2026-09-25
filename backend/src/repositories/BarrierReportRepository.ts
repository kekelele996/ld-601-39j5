import { seed } from "../seed";
import type { BarrierReport } from "../models/BarrierReport";

// 内存数据源：审核流程要真正改写工单/设施/路线，因此不再直接返回只读种子。
const rows: BarrierReport[] = seed.barrierReport.map((row) => ({ ...row }));

export const barrierReportRepository = {
  findAll: (): BarrierReport[] => rows.map((row) => ({ ...row })),
  findById: (id: number): BarrierReport | undefined => rows.find((row) => row.id === id),
  save: (row: BarrierReport): BarrierReport => {
    const index = rows.findIndex((item) => item.id === row.id);
    if (index >= 0) rows[index] = { ...row };
    else rows.push({ ...row });
    return { ...row };
  }
};
