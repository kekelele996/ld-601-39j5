import { useEffect, useMemo, useState } from "react";
import { useAccessibleFacilityStore } from "../stores/AccessibleFacilityStore";
import { useBarrierReportStore } from "../stores/BarrierReportStore";
import { FacilityStatusText } from "../constants/FacilityStatus";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { formatDate, formatFacilityStatus } from "../utils/formatters";
import { StatusBadge } from "../components/common/StatusBadge";
import { FacilityTag } from "../components/common/FacilityTag";
import { EmptyState } from "../components/common/EmptyState";
import type { AccessibleFacility } from "../types/AccessibleFacility";

export function FacilitiesPage() {
  const { rows, loading, load, markStatus, actingId } = useAccessibleFacilityStore();
  const reports = useBarrierReportStore((state) => state.rows);
  const [floor, setFloor] = useState<string>("ALL");

  useEffect(() => {
    void load();
    if (reports.length === 0) void useBarrierReportStore.getState().load();
  }, [load, reports.length]);

  const floors = useMemo(() => ["ALL", ...Array.from(new Set(rows.map((row) => row.floor)))], [rows]);
  const visibleRows = useMemo(
    () => (floor === "ALL" ? rows : rows.filter((row) => row.floor === floor)),
    [rows, floor]
  );

  const activeReportsByFacility = useMemo(() => {
    const map = new Map<number, number>();
    for (const report of reports) {
      if (report.verify_status === "APPROVED") {
        map.set(report.facility_id, (map.get(report.facility_id) ?? 0) + 1);
      }
    }
    return map;
  }, [reports]);

  const handleMark = (facility: AccessibleFacility, status: string) => {
    console.info(LOG_TEMPLATES.AccessibleFacility[2], facility.id, status);
    void markStatus(facility.id, status);
  };

  const statusTone = (status: string) =>
    status === "BLOCKED" ? "danger" : status === "MAINTENANCE" ? "warning" : undefined;

  return (
    <section className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">accessroute / facilities</p>
          <h1>设施巡检</h1>
          <p className="page-desc">
            巡检可把设施标记为维修；被通过工单停用的设施会显示停用原因。之后工单关闭回退时，维修中的设施仍保持维修。
          </p>
        </div>
      </header>

      <div className="filter-bar">
        {floors.map((value) => (
          <button
            key={value}
            className={"chip" + (floor === value ? " active" : "")}
            onClick={() => setFloor(value)}
          >
            {value === "ALL" ? "全部楼层" : value}
          </button>
        ))}
      </div>

      {loading && rows.length === 0 ? (
        <EmptyState title="设施加载中…" />
      ) : (
        <div className="grid-list">
          {visibleRows.map((facility) => {
            const blockedByCount = activeReportsByFacility.get(facility.id) ?? 0;
            const acting = actingId === facility.id;
            return (
              <article key={facility.id} className="panel facility-card">
                <div className="facility-card-head">
                  <FacilityTag title={facility.name} value={facility.status} label={formatFacilityStatus(facility.status)} />
                  <span className="facility-code">{facility.location_code}</span>
                </div>
                <p className="facility-note">{facility.note}</p>
                <dl className="report-fields compact">
                  <div>
                    <dt>楼层</dt>
                    <dd>{facility.floor}</dd>
                  </div>
                  <div>
                    <dt>权属部门</dt>
                    <dd>{facility.owner_department}</dd>
                  </div>
                  <div>
                    <dt>最近巡检</dt>
                    <dd>{formatDate(facility.last_checked_at)}</dd>
                  </div>
                  <div>
                    <dt>当前状态</dt>
                    <dd>
                      <StatusBadge value={facility.status} label={formatFacilityStatus(facility.status)} tone={statusTone(facility.status)} />
                    </dd>
                  </div>
                </dl>
                {blockedByCount > 0 && (
                  <p className="blocked-reason">已被 {blockedByCount} 张通过工单停用，相关路线风险已升高</p>
                )}
                <div className="report-actions">
                  <button
                    className="btn"
                    disabled={acting || facility.status === "MAINTENANCE"}
                    onClick={() => handleMark(facility, "MAINTENANCE")}
                  >
                    {acting ? "提交中…" : FacilityStatusText.MAINTENANCE + "（巡检标记）"}
                  </button>
                  <button
                    className="btn"
                    disabled={acting || facility.status === "AVAILABLE" || blockedByCount > 0}
                    title={blockedByCount > 0 ? "存在未关闭的通过工单时不能恢复可用" : undefined}
                    onClick={() => handleMark(facility, "AVAILABLE")}
                  >
                    恢复可用
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
