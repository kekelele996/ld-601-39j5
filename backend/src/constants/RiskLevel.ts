export const RiskLevel = ["LOW", "MEDIUM", "HIGH"] as const;
export type RiskLevel = (typeof RiskLevel)[number];
