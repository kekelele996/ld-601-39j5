import { seed } from "../seed";
import type { BarrierReport } from "../models/BarrierReport";

const rows: BarrierReport[] = (seed.barrierReport as unknown as BarrierReport[]).map((row) => ({ ...row }));

export const barrierReportRepository = {
  findAll: () => rows,
  findById: (id: number) => rows.find((row) => row.id === id) ?? null,
  save: (row: BarrierReport) => {
    rows.push(row);
    return row;
  },
  update: (id: number, patch: Partial<BarrierReport>) => {
    const index = rows.findIndex((row) => row.id === id);
    if (index < 0) return null;
    rows[index] = { ...rows[index], ...patch };
    return rows[index];
  }
};
