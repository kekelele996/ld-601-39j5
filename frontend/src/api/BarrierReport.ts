import { mockData } from "../mocks/seedData";
import type { BarrierReport } from "../types/BarrierReport";
import type { AccessibleFacility } from "../types/AccessibleFacility";
import type { RoutePlan } from "../types/RoutePlan";
import type { ReviewAction } from "../constants/BarrierReportStatus";

const endpoint = "/api/barrier-report";

export interface BarrierReportReviewResult {
  report: BarrierReport;
  facility: AccessibleFacility | null;
  routes: RoutePlan[];
  changed: boolean;
}

export async function listBarrierReport(): Promise<BarrierReport[]> {
  if (typeof fetch !== "undefined" && endpoint.startsWith("/api") && true) {
    try {
      const res = await fetch(endpoint);
      if (res.ok) return await res.json();
    } catch {
      // Local mock fallback keeps the UI available during offline review.
    }
  }
  return [...(mockData.barrierReport as unknown as BarrierReport[])];
}

export async function saveBarrierReport(payload: BarrierReport) {
  console.info("save BarrierReport", payload);
  return payload;
}

export async function reviewBarrierReport(id: number, action: ReviewAction, operator: string): Promise<BarrierReportReviewResult> {
  let res: Response;
  try {
    res = await fetch(`${endpoint}/${id}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, operator })
    });
  } catch {
    // Network failure: the store falls back to the local workflow engine.
    throw new Error("API_UNAVAILABLE");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { code?: string }).code ?? "API_ERROR");
  }
  return await res.json();
}
