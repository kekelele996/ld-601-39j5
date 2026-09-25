export const VerifyStatus = ["PENDING", "APPROVED", "REJECTED", "CLOSED"] as const;
export type VerifyStatus = (typeof VerifyStatus)[number];
export const VerifyStatusText: Record<VerifyStatus, string> = {
  PENDING: "待审",
  APPROVED: "已通过",
  REJECTED: "已驳回",
  CLOSED: "已关闭"
};

export const ReviewAction = ["APPROVE", "REJECT", "CLOSE"] as const;
export type ReviewAction = (typeof ReviewAction)[number];
export const ReviewActionText: Record<ReviewAction, string> = {
  APPROVE: "通过",
  REJECT: "驳回",
  CLOSE: "关闭"
};
export const ReviewActionToStatus: Record<ReviewAction, VerifyStatus> = {
  APPROVE: "APPROVED",
  REJECT: "REJECTED",
  CLOSE: "CLOSED"
};

// Approving a report disables the facility and raises route risk to this level.
export const FACILITY_DISABLED_STATUS = "BLOCKED";
export const ROUTE_RISK_ON_BARRIER = "HIGH";
