import { localDb } from "../mocks/localDb";
import type { RoutePlan } from "../types/RoutePlan";

const endpoint = "/api/route-plan";

export async function listRoutePlan(): Promise<RoutePlan[]> {
  try {
    const res = await fetch(endpoint);
    if (res.ok) return await res.json();
  } catch {
    // Local mock fallback keeps the UI available during offline review.
  }
  return localDb.routes();
}

export async function saveRoutePlan(payload: RoutePlan) {
  console.info("save RoutePlan", payload);
  return payload;
}
