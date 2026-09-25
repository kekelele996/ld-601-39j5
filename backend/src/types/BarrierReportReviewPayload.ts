export type ReviewAction = "approve" | "reject" | "close";

export interface BarrierReportReviewPayload {
  action: ReviewAction;
  reviewer?: string;
  review_note?: string;
}
