import { create } from "zustand";
import { listBarrierReport, reviewBarrierReportRequest } from "../api/BarrierReport";
import { useAccessibleFacilityStore } from "./AccessibleFacilityStore";
import { useRoutePlanStore } from "./RoutePlanStore";
import type { BarrierReport } from "../types/BarrierReport";
import type { ReviewAction } from "../types/ReviewBarrierReport";

type State = {
  rows: BarrierReport[];
  loading: boolean;
  actingId: number | null;
  /** 最近一次重复处理回显提示（当前状态 + 处理人） */
  duplicateNotice: { id: number; text: string } | null;
  load: () => Promise<void>;
  clearNotice: () => void;
  review: (id: number, action: ReviewAction, reviewer: string, note?: string) => Promise<boolean>;
};

export const useBarrierReportStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  actingId: null,
  duplicateNotice: null,

  async load() {
    set({ loading: true });
    set({ rows: await listBarrierReport(), loading: false });
  },

  clearNotice() {
    set({ duplicateNotice: null });
  },

  /**
   * 处理工单。成功后同步刷新设施与路线 store，保证切到设施/路线页立即看到联动结果。
   * 返回 changed：true=状态发生流转；false=重复处理，仅回显当前状态与处理人。
   */
  async review(id, action, reviewer, note = "") {
    set({ actingId: id, duplicateNotice: null });
    try {
      const result = await reviewBarrierReportRequest(id, action, reviewer, note);

      // 直接写入接口返回的最新快照，设施/路线联动不依赖重新拉取的时机。
      useAccessibleFacilityStore.setState({ rows: result.facilities });
      useRoutePlanStore.setState({ rows: result.routes });
      set((state) => ({
        rows: state.rows.map((row) => (row.id === id ? result.report : row))
      }));

      if (!result.changed) {
        set({
          duplicateNotice: {
            id,
            text: `该工单已为「${result.report.verify_status}」状态，处理人：${
              result.report.reviewer ?? "-"
            }，设施与路线未再变化`
          }
        });
      }
      return result.changed;
    } finally {
      set({ actingId: null });
    }
  }
}));
