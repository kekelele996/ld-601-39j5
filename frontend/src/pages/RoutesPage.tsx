import { useEffect } from "react";
import { useRoutePlanStore } from "../stores/RoutePlanStore";
import { useAccessibleFacilityStore } from "../stores/AccessibleFacilityStore";
import { RouteRiskPanel } from "../components/common/RouteRiskPanel";
import { FacilityTag } from "../components/common/FacilityTag";
import { EmptyState } from "../components/common/EmptyState";
import { formatDate, formatRisk } from "../utils/formatters";

export function RoutesPage() {
  const { rows, loading, load } = useRoutePlanStore();
  const facilities = useAccessibleFacilityStore((state) => state.rows);
  const loadFacilities = useAccessibleFacilityStore((state) => state.load);

  useEffect(() => {
    load();
    loadFacilities();
  }, [load, loadFacilities]);

  const facilityById = (id: number) => facilities.find((row) => row.id === id);

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">accessroute</p>
          <h1>路线规划</h1>
        </div>
      </section>
      {loading && <EmptyState title="加载中…" />}
      {!loading && rows.length === 0 && <EmptyState title="暂无路线" />}
      <section className="route-list">
        {rows.map((route) => (
          <article key={route.id} className="panel route-card">
            <header className="route-head">
              <strong>路线 #{route.id}：{route.origin_text} → {route.destination_text}</strong>
              <span className="meta">
                方式：{route.route_mode} · 预计 {route.estimated_minutes} 分钟 · 风险：{formatRisk(route.risk_level)} · 创建于 {formatDate(route.created_at)}
              </span>
            </header>
            <RouteRiskPanel title={`风险等级（${formatRisk(route.risk_level)}）`} value={route.risk_level} />
            <div className="tags">
              {route.facility_ids.map((id) => {
                const facility = facilityById(id);
                return (
                  <FacilityTag
                    key={id}
                    title={facility ? `${facility.name}（${facility.location_code}）` : `设施 #${id}`}
                    value={facility?.status ?? "UNKNOWN"}
                  />
                );
              })}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
