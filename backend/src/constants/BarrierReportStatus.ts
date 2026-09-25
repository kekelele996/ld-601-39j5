export const VerifyStatus = ["PENDING", "APPROVED", "REJECTED", "CLOSED"] as const;
export type VerifyStatus = (typeof VerifyStatus)[number];

export const ReviewAction = ["APPROVE", "REJECT", "CLOSE"] as const;
export type ReviewAction = (typeof ReviewAction)[number];

export const ReviewActionToStatus: Record<ReviewAction, VerifyStatus> = {
  APPROVE: "APPROVED",
  REJECT: "REJECTED",
  CLOSE: "CLOSED"
};

// Approving a report disables the facility and raises route risk to this level.
export const FACILITY_DISABLED_STATUS = "BLOCKED";
export const ROUTE_RISK_ON_BARRIER = "HIGH";
