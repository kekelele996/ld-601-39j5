import { VerifyStatusText, type VerifyStatus } from "../constants/BarrierReportStatus";
import type { BarrierReport } from "../types/BarrierReport";
import type { AccessibleFacility } from "../types/AccessibleFacility";
import type { RoutePlan } from "../types/RoutePlan";

export const formatDate = (value: string) => new Date(value).toLocaleString("zh-CN");
export const formatStatus = (value: string) => value.replace(/_/g, " ");
export const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);
export const formatRisk = (value: string) => ({ LOW: "低", MEDIUM: "中", HIGH: "高", CRITICAL: "严重", EXTREME: "极高" }[value] ?? value);
export const formatVerifyStatus = (value: string) => VerifyStatusText[value as VerifyStatus] ?? value;

export const formatReviewMessage = (result: {
  report: BarrierReport;
  facility: AccessibleFacility | null;
  routes: RoutePlan[];
  changed: boolean;
}) => {
  const statusText = formatVerifyStatus(result.report.verify_status);
  if (!result.changed) {
    return `工单 #${result.report.id} 已是「${statusText}」状态，处理人：${result.report.handled_by ?? "—"}，本次操作未改动设施与路线`;
  }
  if (result.report.verify_status === "APPROVED") {
    return `工单 #${result.report.id} 已通过：设施「${result.facility?.name ?? result.report.facility_id}」已停用，${result.routes.length} 条包含该设施的路线风险升为高`;
  }
  return `工单 #${result.report.id} ${statusText}：仅回退本工单造成的影响，巡检等其他变更保持不变`;
};
