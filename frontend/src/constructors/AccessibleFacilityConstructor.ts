import type { AccessibleFacility } from "../types/AccessibleFacility";

export const createDefaultAccessibleFacility = (overrides: Partial<AccessibleFacility> = {}): AccessibleFacility => ({
  id: 1,
  facility_type: "RAMP",
  name: "东门无障碍坡道",
  location_code: "GATE-E-RAMP-01",
  floor: "1F",
  status: "AVAILABLE",
  last_checked_at: "2026-09-20T09:00:00Z",
  owner_department: "物业一部",
  note: "",
  base_status: undefined,
  ...overrides
});

export const createAccessibleFacilityForm = createDefaultAccessibleFacility;
export const createAccessibleFacilityResponse = createDefaultAccessibleFacility;
