import { create } from "zustand";
import { listBarrierReport, reviewBarrierReport, type BarrierReportReviewResult } from "../api/BarrierReport";
import type { BarrierReport } from "../types/BarrierReport";
import type { ReviewAction } from "../constants/BarrierReportStatus";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { reviewReportWorkflow } from "../utils/barrierReportWorkflow";
import { formatReviewMessage } from "../utils/formatters";
import { useAccessibleFacilityStore } from "./AccessibleFacilityStore";
import { useRoutePlanStore } from "./RoutePlanStore";

type State = {
  rows: BarrierReport[];
  loading: boolean;
  loaded: boolean;
  processing: boolean;
  lastMessage: string | null;
  load: () => Promise<void>;
  review: (id: number, action: ReviewAction, operator: string) => Promise<BarrierReportReviewResult>;
};

export const useBarrierReportStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  loaded: false,
  processing: false,
  lastMessage: null,
  async load() {
    if (get().loaded || get().loading) return;
    set({ loading: true });
    set({ rows: await listBarrierReport(), loading: false, loaded: true });
  },
  async review(id, action, operator) {
    set({ processing: true });
    const commit = (result: BarrierReportReviewResult) => {
      // One commit fans out to every store, so the routes and facilities
      // pages keep showing the new risk levels and facility status.
      set((state) => ({
        rows: state.rows.map((row) => (row.id === result.report.id ? result.report : row)),
        processing: false,
        lastMessage: formatReviewMessage(result)
      }));
      if (result.facility) useAccessibleFacilityStore.getState().upsert(result.facility);
      if (result.routes.length > 0) useRoutePlanStore.getState().upsertAll(result.routes);
      console.info(result.changed ? LOG_TEMPLATES.BarrierReport[4] : LOG_TEMPLATES.BarrierReport[6], result.report.id);
      return result;
    };
    try {
      return commit(await reviewBarrierReport(id, action, operator));
    } catch (err) {
      if ((err as Error).message !== "API_UNAVAILABLE") {
        set({ processing: false });
        throw err;
      }
      // Offline fallback: run the same state machine against local data.
      const report = get().rows.find((row) => row.id === id);
      if (!report) {
        set({ processing: false });
        throw err;
      }
      const facility = useAccessibleFacilityStore.getState().rows.find((row) => row.id === report.facility_id) ?? null;
      const routes = useRoutePlanStore.getState().rows.filter((row) => row.facility_ids.includes(report.facility_id));
      return commit(reviewReportWorkflow({ report, facility, routes, action, operator, now: new Date().toISOString() }));
    }
  }
}));
