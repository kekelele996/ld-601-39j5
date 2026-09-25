import { useEffect, useState } from "react";
import { useBarrierReportStore } from "../stores/BarrierReportStore";
import { useAccessibleFacilityStore } from "../stores/AccessibleFacilityStore";
import { useRoutePlanStore } from "../stores/RoutePlanStore";
import { StatusBadge } from "../components/common/StatusBadge";
import { EmptyState } from "../components/common/EmptyState";
import { ReviewAction, ReviewActionText } from "../constants/BarrierReportStatus";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { formatDate, formatVerifyStatus } from "../utils/formatters";

export function ReportsPage() {
  const { rows, loading, load, review, processing, lastMessage } = useBarrierReportStore();
  const facilities = useAccessibleFacilityStore((state) => state.rows);
  const loadFacilities = useAccessibleFacilityStore((state) => state.load);
  const loadRoutes = useRoutePlanStore((state) => state.load);
  const [operator, setOperator] = useState("auditor-01");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
    loadFacilities();
    loadRoutes();
  }, [load, loadFacilities, loadRoutes]);

  const facilityName = (id: number) => facilities.find((row) => row.id === id)?.name ?? `设施 #${id}`;

  const handleReview = async (id: number, action: ReviewAction) => {
    setError(null);
    try {
      await review(id, action, operator);
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
          <h1>障碍工单</h1>
        </div>
        <StatusBadge value="REVIEW_FLOW" />
      </section>
      <section className="panel wide">
        <div className="toolbar">
          <label>
            处理人
            <input value={operator} onChange={(event) => setOperator(event.target.value)} placeholder="处理人" />
          </label>
          <span className="hint">通过后设施停用、相关路线风险升高；驳回或关闭仅回退本工单造成的影响。</span>
        </div>
        {lastMessage && <p className="banner">{lastMessage}</p>}
        {error && <p className="banner error">{error}</p>}
        {loading && <EmptyState title="加载中…" />}
        {!loading && rows.length === 0 && <EmptyState title="暂无障碍工单" />}
        <div className="table">
          {rows.map((report) => (
            <article key={report.id} className="row report-row">
              <div className="report-main">
                <strong>工单 #{report.id} · {report.barrier_type}</strong>
                <span>{report.description}</span>
                <span className="meta">
                  设施：{facilityName(report.facility_id)} · 优先级：{report.priority} · 上报人：#{report.reporter_id}
                </span>
                <span className="meta">
                  当前状态：{formatVerifyStatus(report.verify_status)}
                  {report.handled_by ? ` · 处理人：${report.handled_by}` : ""}
                  {report.handled_at ? ` · 处理时间：${formatDate(report.handled_at)}` : ""}
                </span>
              </div>
              <StatusBadge value={report.verify_status} />
              <div className="actions">
                {ReviewAction.map((action) => (
                  <button
                    key={action}
                    className="btn"
                    disabled={processing}
                    onClick={() => handleReview(report.id, action)}
                  >
                    {ReviewActionText[action]}
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
