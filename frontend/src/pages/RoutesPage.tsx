import { useEffect, useMemo } from "react";
import { useRoutePlanStore } from "../stores/RoutePlanStore";
import { useAccessibleFacilityStore } from "../stores/AccessibleFacilityStore";
import { useBarrierReportStore } from "../stores/BarrierReportStore";
import { useRouteRisk } from "../hooks/useRouteRisk";
import { formatDate, formatRisk } from "../utils/formatters";
import { StatusBadge } from "../components/common/StatusBadge";
import { RouteRiskPanel } from "../components/common/RouteRiskPanel";
import { EmptyState } from "../components/common/EmptyState";
import { StatCard } from "../components/common/StatCard";

export function RoutesPage() {
  const routes = useRoutePlanStore((state) => state.rows);
  const loadRoutes = useRoutePlanStore((state) => state.load);
  const facilities = useAccessibleFacilityStore((state) => state.rows);
  const loadFacilities = useAccessibleFacilityStore((state) => state.load);
  const reports = useBarrierReportStore((state) => state.rows);
  const loadReports = useBarrierReportStore((state) => state.load);

  useEffect(() => {
    // store 是全局单例：工单页处理完后切回本页，行数据与风险联动依然保留。
    void loadRoutes();
    void loadFacilities();
    void loadReports();
  }, [loadRoutes, loadFacilities, loadReports]);

  const { views, highRiskCount } = useRouteRisk(routes, facilities, reports);

  const affectedFacilityCount = useMemo(
    () => new Set(views.flatMap((view) => view.blockedFacilityNames)).size,
    [views]
  );

  return (
    <section className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">accessroute / routes</p>
          <h1>路线规划</h1>
          <p className="page-desc">
            工单通过后，包含该设施的路线风险升到高；关闭工单回退后恢复原风险等级。切回本页仍可看到最新风险与受影响设施。
          </p>
        </div>
      </header>

      <section className="metrics">
        <StatCard label="路线总数" value={views.length} />
        <StatCard label="当前高风险路线" value={highRiskCount} />
        <StatCard label="受影响设施" value={affectedFacilityCount} />
      </section>

      {views.length === 0 ? (
        <EmptyState title="路线加载中…" />
      ) : (
        <div className="card-list">
          {views.map(({ route, riskLevel, blockedFacilityNames, maintenanceFacilityNames, hasOpenBarrier }) => (
            <article key={route.id} className={"panel route-card" + (riskLevel === "HIGH" ? " is-high" : "")}>
              <div className="route-card-head">
                <div>
                  <h2>
                    <span className="report-id">路线#{route.id}</span>
                    {route.origin_text} → {route.destination_text}
                  </h2>
                  <p className="route-sub">
                    {route.route_mode} · 约 {route.estimated_minutes} 分钟 · 创建于 {formatDate(route.created_at)}
                  </p>
                </div>
                <RouteRiskPanel
                  title="路线风险"
                  value={riskLevel}
                  affectedFacilities={blockedFacilityNames}
                />
              </div>

              <div className="route-facilities">
                {route.facility_ids.map((id) => {
                  const facility = facilities.find((row) => row.id === id);
                  if (!facility) {
                    return <StatusBadge key={id} value={`FACILITY_${id}`} label={`设施 #${id}`} />;
                  }
                  const tone =
                    facility.status === "BLOCKED"
                      ? "danger"
                      : facility.status === "MAINTENANCE"
                        ? "warning"
                        : undefined;
                  return (
                    <StatusBadge
                      key={id}
                      value={facility.status}
                      label={`${facility.name} · ${facility.status === "BLOCKED" ? "停用" : facility.status === "MAINTENANCE" ? "维修中" : "可用"}`}
                      tone={tone}
                    />
                  );
                })}
              </div>

              {hasOpenBarrier && (
                <p className="blocked-reason">
                  存在已通过未关闭的障碍工单，风险已升至
                  <StatusBadge value="HIGH" label={formatRisk("HIGH")} tone="danger" />
                  ，请优先绕行
                </p>
              )}
              {maintenanceFacilityNames.length > 0 && (
                <p className="muted-reason">维修中设施：{maintenanceFacilityNames.join("、")}（巡检标记，工单回退不改变该状态）</p>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
