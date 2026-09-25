import type { BarrierReport } from "../types/BarrierReport";

export const createDefaultBarrierReport = (overrides: Partial<BarrierReport> = {}): BarrierReport => ({
  id: 1,
  reporter_id: 1,
  facility_id: 1,
  barrier_type: "坡道堵塞",
  description: "",
  photo_url: "/mock/photo_url-1.png",
  verify_status: "PENDING",
  priority: "MEDIUM",
  reviewer: "",
  reviewed_at: "",
  review_note: "",
  affected_route_ids: [],
  ...overrides
});

export const createBarrierReportForm = createDefaultBarrierReport;
export const createBarrierReportResponse = createDefaultBarrierReport;
