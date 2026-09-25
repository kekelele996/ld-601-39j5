import { localDb } from "../mocks/localDb";
import type { BarrierReport } from "../types/BarrierReport";
import type { AccessibleFacility } from "../types/AccessibleFacility";
import type { RoutePlan } from "../types/RoutePlan";
import type {
  ReviewAction,
  ReviewBarrierReportPayload,
  ReviewBarrierReportResult
} from "../types/ReviewBarrierReport";

const endpoint = "/api/barrier-report";

/** 后端审核接口的完整响应：工单 + 受影响的设施与路线快照 */
type ReviewEnvelope = {
  report: BarrierReport;
  facilities: AccessibleFacility[];
  routes: RoutePlan[];
};

export type ReviewResponse = ReviewBarrierReportResult;

export async function listBarrierReport(): Promise<BarrierReport[]> {
  try {
    const res = await fetch(endpoint);
    if (res.ok) return (await res.json()) as BarrierReport[];
  } catch {
    // Local mock fallback keeps the UI available during offline review.
  }
  return localDb.reports();
}

export async function saveBarrierReport(payload: BarrierReport) {
  console.info("save BarrierReport", payload);
  return payload;
}

/**
 * 审核工单。成功与重复处理（409）都返回最新的设施/路线快照：
 * changed=true 表示发生了流转；false 表示工单此前已处理，仅回显当前状态与处理人。
 */
export async function reviewBarrierReportRequest(
  id: number,
  action: ReviewAction,
  reviewer: string,
  reviewNote = ""
): Promise<ReviewResponse> {
  const payload: ReviewBarrierReportPayload = { action, reviewer, review_note: reviewNote };
  try {
    const res = await fetch(`${endpoint}/${id}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-role": "auditor" },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const data = (await res.json()) as ReviewEnvelope;
      return { ...data, changed: true };
    }
    if (res.status === 409) {
      const data = (await res.json()) as ReviewEnvelope;
      return { ...data, changed: false };
    }
  } catch {
    // fall through to local workflow engine
  }
  return localDb.review(id, payload, reviewer);
}
