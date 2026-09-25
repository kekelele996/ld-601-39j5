import { useEffect } from "react";
import { useBarrierReportStore } from "../stores/BarrierReportStore";
import { useAccessibleFacilityStore } from "../stores/AccessibleFacilityStore";
import { useRoutePlanStore } from "../stores/RoutePlanStore";
import { useRouteRisk } from "../hooks/useRouteRisk";
import { StatCard } from "../components/common/StatCard";
import { StatusBadge } from "../components/common/StatusBadge";
import { RouteRiskPanel } from "../components/common/RouteRiskPanel";
import { EmptyState } from "../components/common/EmptyState";
import { formatRisk, formatVerifyStatus } from "../utils/formatters";

export function DashboardPage() {
  const reports = useBarrierReportStore((state) => state.rows);
  const loadReports = useBarrierReportStore((state) => state.load);
  const facilities = useAccessibleFacilityStore((state) => state.rows);
  const loadFacilities = useAccessibleFacilityStore((state) => state.load);
  const routes = useRoutePlanStore((state) => state.rows);
  const loadRoutes = useRoutePlanStore((state) => state.load);

  useEffect(() => {
    void loadReports();
    void loadFacilities();
    void loadRoutes();
  }, [loadReports, loadFacilities, loadRoutes]);

  const { views, highRiskCount } = useRouteRisk(routes, facilities, reports);
  const pendingCount = reports.filter((row) => row.verify_status === "PENDING").length;
  const abnormalCount = facilities.filter(
    (row) => row.status === "BLOCKED" || row.status === "MAINTENANCE"
  ).length;

  return (
    <section className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">accessroute / dashboard</p>
          <h1>通行总览</h1>
        </div>
        <StatusBadge value="LOCAL_DATA" label="本地数据" />
      </header>

      <section className="metrics">
        <StatCard label="待审障碍工单" value={pendingCount} />
        <StatCard label="高风险路线" value={highRiskCount} />
        <StatCard label="异常设施（停用/维修）" value={abnormalCount} />
      </section>

      <section className="workbench workbench-stack">
        <div className="panel wide">
          <h2>风险路线</h2>
          {views.filter((view) => view.riskLevel === "HIGH").length === 0 ? (
            <EmptyState title="暂无高风险路线" />
          ) : (
            <div className="risk-grid">
              {views
                .filter((view) => view.riskLevel === "HIGH")
                .map((view) => (
                  <RouteRiskPanel
                    key={view.route.id}
                    title={`路线#${view.route.id} ${view.route.origin_text} → ${view.route.destination_text}`}
                    value={view.riskLevel}
                    affectedFacilities={view.blockedFacilityNames}
                  />
                ))}
            </div>
          )}
        </div>
        <div className="panel">
          <h2>最新工单</h2>
          {reports.length === 0 ? (
            <EmptyState title="暂无工单" />
          ) : (
            <div className="table">
              {reports.slice(0, 5).map((report) => (
                <article key={report.id} className="row">
                  <strong>
                    #{report.id} {report.barrier_type}
                  </strong>
                  <span>优先级 {formatRisk(report.priority)}</span>
                  <StatusBadge value={report.verify_status} label={formatVerifyStatus(report.verify_status)} />
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </section>
  );
}
