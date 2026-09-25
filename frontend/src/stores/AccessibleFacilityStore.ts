import { create } from "zustand";
import { listAccessibleFacility, updateAccessibleFacilityStatus } from "../api/AccessibleFacility";
import type { AccessibleFacility } from "../types/AccessibleFacility";
import { LOG_TEMPLATES } from "../constants/logTemplates";

type State = {
  rows: AccessibleFacility[];
  loading: boolean;
  loaded: boolean;
  load: () => Promise<void>;
  upsert: (facility: AccessibleFacility) => void;
  updateStatus: (id: number, status: string) => Promise<void>;
};

export const useAccessibleFacilityStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  loaded: false,
  async load() {
    if (get().loaded || get().loading) return;
    set({ loading: true });
    set({ rows: await listAccessibleFacility(), loading: false, loaded: true });
  },
  upsert(facility) {
    set((state) => ({
      rows: state.rows.some((row) => row.id === facility.id)
        ? state.rows.map((row) => (row.id === facility.id ? facility : row))
        : [...state.rows, facility]
    }));
  },
  async updateStatus(id, status) {
    try {
      get().upsert(await updateAccessibleFacilityStatus(id, status));
    } catch (err) {
      if ((err as Error).message !== "API_UNAVAILABLE") throw err;
      // Offline fallback: apply the inspection result to local data.
      const row = get().rows.find((item) => item.id === id);
      if (row) get().upsert({ ...row, status, last_checked_at: new Date().toISOString() });
    }
    console.info(LOG_TEMPLATES.AccessibleFacility[2], id, status);
  }
}));
