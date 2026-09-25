export const VerifyStatus = ["PENDING", "APPROVED", "REJECTED", "CLOSED"] as const;
export type VerifyStatus = (typeof VerifyStatus)[number];
export const VerifyStatusText: Record<VerifyStatus, string> = {
  PENDING: "待审",
  APPROVED: "通过",
  REJECTED: "驳回",
  CLOSED: "关闭"
};
