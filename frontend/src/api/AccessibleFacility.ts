import { mockData } from "../mocks/seedData";
import type { AccessibleFacility } from "../types/AccessibleFacility";

const endpoint = "/api/accessible-facility";

export async function listAccessibleFacility(): Promise<AccessibleFacility[]> {
  if (typeof fetch !== "undefined" && endpoint.startsWith("/api") && true) {
    try {
      const res = await fetch(endpoint);
      if (res.ok) return await res.json();
    } catch {
      // Local mock fallback keeps the UI available during offline review.
    }
  }
  return [...(mockData.accessibleFacility as unknown as AccessibleFacility[])];
}

export async function saveAccessibleFacility(payload: AccessibleFacility) {
  console.info("save AccessibleFacility", payload);
  return payload;
}

export async function updateAccessibleFacilityStatus(id: number, status: string): Promise<AccessibleFacility> {
  let res: Response;
  try {
    res = await fetch(`${endpoint}/${id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
  } catch {
    // Network failure: the store applies the inspection result locally.
    throw new Error("API_UNAVAILABLE");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { code?: string }).code ?? "API_ERROR");
  }
  return await res.json();
}
