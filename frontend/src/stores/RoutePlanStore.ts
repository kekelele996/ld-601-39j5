import { create } from "zustand";
import { listRoutePlan } from "../api/RoutePlan";
import type { RoutePlan } from "../types/RoutePlan";

type State = {
  rows: RoutePlan[];
  loading: boolean;
  loaded: boolean;
  load: () => Promise<void>;
  upsertAll: (routes: RoutePlan[]) => void;
};

export const useRoutePlanStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  loaded: false,
  async load() {
    if (get().loaded || get().loading) return;
    set({ loading: true });
    set({ rows: await listRoutePlan(), loading: false, loaded: true });
  },
  upsertAll(routes) {
    set((state) => {
      const known = new Set(state.rows.map((row) => row.id));
      return {
        rows: [
          ...state.rows.map((row) => routes.find((route) => route.id === row.id) ?? row),
          ...routes.filter((route) => !known.has(route.id))
        ]
      };
    });
  }
}));
