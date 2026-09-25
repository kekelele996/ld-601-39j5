export function StatusBadge({
  value,
  label,
  tone
}: {
  value: string;
  label?: string;
  tone?: string;
}) {
  const toneClass = tone ? " badge-" + tone : "";
  return (
    <span className={"badge" + toneClass + " " + String(value).toLowerCase().replace(/_/g, "-")}>
      {label ?? String(value).replace(/_/g, " ")}
    </span>
  );
}
