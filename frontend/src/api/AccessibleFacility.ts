import { localDb } from "../mocks/localDb";
import type { AccessibleFacility } from "../types/AccessibleFacility";

const endpoint = "/api/accessible-facility";

export async function listAccessibleFacility(): Promise<AccessibleFacility[]> {
  try {
    const res = await fetch(endpoint);
    if (res.ok) return await res.json();
  } catch {
    // Local mock fallback keeps the UI available during offline review.
  }
  return localDb.facilities();
}

export async function saveAccessibleFacility(payload: AccessibleFacility) {
  console.info("save AccessibleFacility", payload);
  return payload;
}

/** 巡检更新设施状态（如标记维修）。维修状态由巡检独立维护，工单关闭回退不会覆盖它。 */
export async function updateAccessibleFacilityStatus(
  id: number,
  status: string
): Promise<AccessibleFacility> {
  try {
    const res = await fetch(`${endpoint}/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-role": "facility_manager" },
      body: JSON.stringify({ status })
    });
    if (res.ok) return await res.json();
  } catch {
    // fall through to local workflow engine
  }
  return localDb.updateFacilityStatus(id, status);
}
