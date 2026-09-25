import type { ReviewAction } from "../constants/BarrierReportStatus";

export type BarrierReportPayload = Record<string, unknown>;
export interface ReviewBarrierReportPayload { action: ReviewAction; operator?: string }
export interface UpdateFacilityStatusPayload { status: string }
