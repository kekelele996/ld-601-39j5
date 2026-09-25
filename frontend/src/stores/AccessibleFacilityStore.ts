import { create } from "zustand";
import { listAccessibleFacility, updateAccessibleFacilityStatus } from "../api/AccessibleFacility";
import type { AccessibleFacility } from "../types/AccessibleFacility";

type State = {
  rows: AccessibleFacility[];
  loading: boolean;
  actingId: number | null;
  load: () => Promise<void>;
  /** 巡检标记设施状态（主要是“维修”）。维修是巡检独立动作，工单关闭回退不会覆盖它。 */
  markStatus: (id: number, status: string) => Promise<void>;
};

export const useAccessibleFacilityStore = create<State>((set) => ({
  rows: [],
  loading: false,
  actingId: null,

  async load() {
    set({ loading: true });
    set({ rows: await listAccessibleFacility(), loading: false });
  },

  async markStatus(id, status) {
    set({ actingId: id });
    try {
      const updated = await updateAccessibleFacilityStatus(id, status);
      set((state) => ({
        rows: state.rows.map((row) => (row.id === id ? updated : row))
      }));
    } finally {
      set({ actingId: null });
    }
  }
}));
