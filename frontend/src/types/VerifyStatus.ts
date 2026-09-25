export const VerifyStatus = ["PENDING", "APPROVED", "REJECTED", "CLOSED"] as const;
export type VerifyStatus = (typeof VerifyStatus)[number];
