import { StatusBadge } from "./StatusBadge";
import { formatRisk } from "../../utils/formatters";

export function RouteRiskPanel({
  title = "RouteRiskPanel",
  value = "READY",
  affectedFacilities
}: {
  title?: string;
  value?: string;
  /** 受影响设施名称列表，风险升高时一并展示 */
  affectedFacilities?: string[];
}) {
  const isRisk = value === "LOW" || value === "MEDIUM" || value === "HIGH";
  return (
    <div className={"shared-widget route-risk" + (value === "HIGH" ? " is-high" : "")}>
      <strong>{title}</strong>
      <StatusBadge
        value={value}
        label={isRisk ? formatRisk(value) : value.replace(/_/g, " ")}
        tone={value === "HIGH" ? "danger" : undefined}
      />
      {affectedFacilities && affectedFacilities.length > 0 && (
        <p className="risk-facilities">受影响设施：{affectedFacilities.join("、")}</p>
      )}
    </div>
  );
}
