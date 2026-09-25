import { useEffect, useMemo, useState } from "react";
import { useBarrierReportStore } from "../stores/BarrierReportStore";
import { useAccessibleFacilityStore } from "../stores/AccessibleFacilityStore";
import { useRoutePlanStore } from "../stores/RoutePlanStore";
import { VerifyStatusText } from "../constants/VerifyStatus";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { formatDate, formatVerifyStatus, formatRisk, formatFacilityStatus } from "../utils/formatters";
import { StatusBadge } from "../components/common/StatusBadge";
import { EmptyState } from "../components/common/EmptyState";
import { TimelineList } from "../components/common/TimelineList";
import type { BarrierReport } from "../types/BarrierReport";
import type { ReviewAction } from "../types/ReviewBarrierReport";

// 审核员身份来自登录态，当前演示环境固定为该账号（authMiddleware 默认 admin/审核员-1）。
const CURRENT_REVIEWER = "审核员-1";

const statusTone = (status: string) =>
  status === "APPROVED"
    ? "danger"
    : status === "REJECTED"
      ? "muted"
      : status === "CLOSED"
        ? "muted"
        : "warning";

export function ReportsPage() {
  const { rows, loading, load, review, actingId, duplicateNotice, clearNotice } =
    useBarrierReportStore();
  const facilities = useAccessibleFacilityStore((state) => state.rows);
  const routes = useRoutePlanStore((state) => state.rows);
  const [filter, setFilter] = useState<string>("ALL");

  useEffect(() => {
    void load();
  }, [load]);

  const facilityMap = useMemo(
    () => new Map(facilities.map((row) => [row.id, row])),
    [facilities]
  );
  const routeMap = useMemo(() => new Map(routes.map((row) => [row.id, row])), [routes]);

  const visibleRows = useMemo(
    () => (filter === "ALL" ? rows : rows.filter((row) => row.verify_status === filter)),
    [rows, filter]
  );

  const handleReview = async (report: BarrierReport, action: ReviewAction) => {
    console.info(LOG_TEMPLATES.BarrierReport[action === "approve" ? 4 : action === "reject" ? 5 : 6], report.id);
    await review(report.id, action, CURRENT_REVIEWER);
  };

  return (
    <section className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">accessroute / reports</p>
          <h1>障碍工单</h1>
          <p className="page-desc">
            通过后对应设施停用、包含该设施的路线风险升到高；驳回或关闭只回退这张工单的影响，巡检标记的维修保持不变。
          </p>
        </div>
        <StatusBadge value={`REVIEWER_${CURRENT_REVIEWER}`} label={`当前处理人：${CURRENT_REVIEWER}`} tone="info" />
      </header>

      <div className="filter-bar">
        {["ALL", "PENDING", "APPROVED", "REJECTED", "CLOSED"].map((value) => (
          <button
            key={value}
            className={"chip" + (filter === value ? " active" : "")}
            onClick={() => setFilter(value)}
          >
            {value === "ALL" ? "全部" : VerifyStatusText[value as keyof typeof VerifyStatusText]}
          </button>
        ))}
      </div>

      {duplicateNotice && (
        <div className="notice notice-warning" role="status">
          <span>{duplicateNotice.text}</span>
          <button className="link-btn" onClick={clearNotice}>知道了</button>
        </div>
      )}

      {loading && rows.length === 0 ? (
        <EmptyState title="工单加载中…" />
      ) : visibleRows.length === 0 ? (
        <EmptyState title="当前筛选下没有工单" />
      ) : (
        <div className="card-list">
          {visibleRows.map((report) => {
            const facility = facilityMap.get(report.facility_id);
            const affectedRoutes = (report.affected_route_ids ?? [])
              .map((id) => routeMap.get(id))
              .filter(Boolean);
            const processed = report.verify_status !== "PENDING";
            const acting = actingId === report.id;

            return (
              <article key={report.id} className="panel report-card">
                <div className="report-card-head">
                  <div>
                    <h2>
                      <span className="report-id">#{report.id}</span>
                      {report.barrier_type}
                    </h2>
                    <p className="report-desc">{report.description}</p>
                  </div>
                  <div className="report-meta">
                    <StatusBadge
                      value={report.verify_status}
                      label={formatVerifyStatus(report.verify_status)}
                      tone={statusTone(report.verify_status)}
                    />
                    <StatusBadge value={report.priority} label={`优先级：${formatRisk(report.priority)}`} />
                  </div>
                </div>

                <dl className="report-fields">
                  <div>
                    <dt>关联设施</dt>
                    <dd>
                      {facility ? `${facility.name}（${facility.location_code}）` : `设施 #${report.facility_id}`}
                      {facility && (
                        <StatusBadge
                          value={facility.status}
                          label={formatFacilityStatus(facility.status)}
                          tone={facility.status === "BLOCKED" ? "danger" : facility.status === "MAINTENANCE" ? "warning" : undefined}
                        />
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt>当前处理人</dt>
                    <dd>{report.reviewer ?? "待分配"}</dd>
                  </div>
                  <div>
                    <dt>处理时间</dt>
                    <dd>{report.reviewed_at ? formatDate(report.reviewed_at) : "-"}</dd>
                  </div>
                  <div>
                    <dt>受影响路线</dt>
                    <dd>
                      {affectedRoutes.length > 0
                        ? affectedRoutes.map((route) => (
                            <span key={route!.id} className="route-chip">
                              路线#{route!.id} {route!.origin_text} → {route!.destination_text}
                              <StatusBadge value={route!.risk_level} label={formatRisk(route!.risk_level)} tone={route!.risk_level === "HIGH" ? "danger" : undefined} />
                            </span>
                          ))
                        : "无"}
                    </dd>
                  </div>
                </dl>

                {report.review_note && <p className="review-note">处理备注：{report.review_note}</p>}

                <div className="report-actions">
                  {report.verify_status === "PENDING" && (
                    <>
                      <button className="btn btn-primary" disabled={acting} onClick={() => handleReview(report, "approve")}>
                        {acting ? "处理中…" : "通过并停用设施"}
                      </button>
                      <button className="btn" disabled={acting} onClick={() => handleReview(report, "reject")}>
                        驳回
                      </button>
                      <button className="btn" disabled={acting} onClick={() => handleReview(report, "close")}>
                        关闭
                      </button>
                    </>
                  )}
                  {report.verify_status === "APPROVED" && (
                    <button className="btn" disabled={acting} onClick={() => handleReview(report, "close")}>
                      {acting ? "回退中…" : "关闭并回退本工单影响"}
                    </button>
                  )}
                  {processed && (
                    <span className="processed-hint">
                      当前为「{formatVerifyStatus(report.verify_status)}」，处理人 {report.reviewer ?? "-"}；重复提交不会再改变设施与路线
                    </span>
                  )}
                </div>

                <TimelineList
                  title="处理记录"
                  entries={[
                    {
                      key: "create",
                      title: "工单上报",
                      desc: `上报人 #${report.reporter_id}`
                    },
                    ...(processed
                      ? [
                          {
                            key: "review",
                            title: `审核${formatVerifyStatus(report.verify_status)}`,
                            status: report.reviewer ?? "",
                            time: report.reviewed_at ? formatDate(report.reviewed_at) : undefined,
                            desc: report.review_note
                          }
                        ]
                      : [])
                  ]}
                />
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
