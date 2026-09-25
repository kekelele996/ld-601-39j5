export const createAccessibleFacilityDto = (overrides = {}) => ({
  id: 1,
  facility_type: "RAMP",
  name: "东门无障碍坡道",
  location_code: "GATE-E-RAMP-01",
  floor: "1F",
  status: "AVAILABLE",
  last_checked_at: "2026-09-20T09:00:00Z",
  owner_department: "物业一部",
  note: "连接东门广场与一层大厅",
  base_status: undefined,
  ...overrides
});
