import { useEffect, useState } from "react";
import { useAccessibleFacilityStore } from "../stores/AccessibleFacilityStore";
import { StatusBadge } from "../components/common/StatusBadge";
import { EmptyState } from "../components/common/EmptyState";
import { FacilityStatusText, type FacilityStatus } from "../constants/FacilityStatus";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { formatDate } from "../utils/formatters";

const INSPECTION_ACTIONS: { status: FacilityStatus; label: string }[] = [
  { status: "MAINTENANCE", label: "标记维修" },
  { status: "AVAILABLE", label: "恢复可用" }
];

export function FacilitiesPage() {
  const { rows, loading, load, updateStatus } = useAccessibleFacilityStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, [load]);

  const handleUpdate = async (id: number, status: string) => {
    setError(null);
    try {
      await updateStatus(id, status);
    } catch (err) {
      const code = (err as Error).message as keyof typeof ERROR_MESSAGES;
      setError(ERROR_MESSAGES[code] ?? `操作失败：${(err as Error).message}`);
    }
  };

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">accessroute</p>
          <h1>设施巡检</h1>
        </div>
      </section>
      <section className="panel wide">
        {error && <p className="banner error">{error}</p>}
        {loading && <EmptyState title="加载中…" />}
        {!loading && rows.length === 0 && <EmptyState title="暂无设施" />}
        <div className="table">
          {rows.map((facility) => (
            <article key={facility.id} className="row report-row">
              <div className="report-main">
                <strong>{facility.name}</strong>
                <span className="meta">
                  {facility.location_code} · {facility.floor} · {facility.owner_department} · 状态：{FacilityStatusText[facility.status as FacilityStatus] ?? facility.status} · 最近巡检：{formatDate(facility.last_checked_at)}
                </span>
              </div>
              <StatusBadge value={facility.status} />
              <div className="actions">
                {INSPECTION_ACTIONS.map((action) => (
                  <button
                    key={action.status}
                    className="btn"
                    disabled={facility.status === action.status}
                    onClick={() => handleUpdate(facility.id, action.status)}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
