export const createRoutePlanDto = (overrides = {}) => ({
  id: 1,
  user_id: 1,
  origin_text: "东门广场",
  destination_text: "三层服务台",
  route_mode: "WHEELCHAIR",
  risk_level: "LOW",
  estimated_minutes: 12,
  facility_ids: [1, 2],
  created_at: "2026-09-15T09:00:00Z",
  base_risk_level: undefined,
  ...overrides
});
