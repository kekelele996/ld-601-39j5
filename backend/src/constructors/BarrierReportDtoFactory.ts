export const createBarrierReportDto = (overrides = {}) => ({
  id: 1,
  reporter_id: 1,
  facility_id: 1,
  barrier_type: "坡道堵塞",
  description: "description 1",
  photo_url: "/mock/photo_url-1.png",
  verify_status: "PENDING",
  priority: "HIGH",
  reviewer: "",
  reviewed_at: "",
  review_note: "",
  affected_route_ids: [],
  ...overrides
});
