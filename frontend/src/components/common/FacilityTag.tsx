import { StatusBadge } from "./StatusBadge";
import { formatFacilityStatus } from "../../utils/formatters";

export function FacilityTag({
  title = "FacilityTag",
  value = "READY",
  label
}: {
  title?: string;
  value?: string;
  label?: string;
}) {
  // 传入已知设施状态时展示中文文案，同时保留通用场景的原样渲染。
  const text = label ?? (/^[A-Z_]+$/.test(value) ? formatFacilityStatus(value) : value);
  return (
    <div className="shared-widget facility-tag">
      <strong>{title}</strong>
      <StatusBadge value={value} label={text} />
    </div>
  );
}
