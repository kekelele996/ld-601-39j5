import { FacilityStatusText } from "../constants/FacilityStatus";
import { VerifyStatusText } from "../constants/VerifyStatus";
import { RiskLevelText } from "../constants/RiskLevel";

export const formatDate = (value: string) =>
  value ? new Date(value).toLocaleString("zh-CN") : "-";

export const formatStatus = (value: string) => value.replace(/_/g, " ");

export const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);

export const formatRisk = (value: string) =>
  (RiskLevelText as Record<string, string>)[value] ??
  ({ CRITICAL: "严重", EXTREME: "极高" } as Record<string, string>)[value] ??
  value;

export const formatFacilityStatus = (value: string) =>
  (FacilityStatusText as Record<string, string>)[value] ?? formatStatus(value);

export const formatVerifyStatus = (value: string) =>
  (VerifyStatusText as Record<string, string>)[value] ?? formatStatus(value);

export const formatPriority = (value: string) => formatRisk(value);
