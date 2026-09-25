import type { BarrierReport, BarrierReportEffects } from "../types/BarrierReport";
import type { AccessibleFacility } from "../types/AccessibleFacility";
import type { RoutePlan } from "../types/RoutePlan";
import {
  ReviewAction,
  ReviewActionToStatus,
  FACILITY_DISABLED_STATUS,
  ROUTE_RISK_ON_BARRIER
} from "../constants/BarrierReportStatus";

export interface ReviewWorkflowInput {
  report: BarrierReport;
  facility: AccessibleFacility | null;
  routes: RoutePlan[];
  action: ReviewAction;
  operator: string;
  now: string;
}

export interface ReviewWorkflowResult {
  report: BarrierReport;
  facility: AccessibleFacility | null;
  routes: RoutePlan[];
  changed: boolean;
}

// Approving snapshots the current facility status and route risk levels so a
// later reject/close can roll back exactly what this report changed.
const applyEffects = (
  report: BarrierReport,
  facility: AccessibleFacility | null,
  routes: RoutePlan[]
): { facility: AccessibleFacility | null; routes: RoutePlan[]; effects: BarrierReportEffects } => {
  const effects: BarrierReportEffects = {
    facility_prev_status: facility?.status ?? "UNKNOWN",
    facility_applied_status: FACILITY_DISABLED_STATUS,
    route_changes: routes.map((route) => ({ route_id: route.id, prev_risk: route.risk_level, applied_risk: ROUTE_RISK_ON_BARRIER }))
  };
  return {
    facility: facility ? { ...facility, status: FACILITY_DISABLED_STATUS } : facility,
    routes: routes.map((route) => ({ ...route, risk_level: ROUTE_RISK_ON_BARRIER })),
    effects
  };
};

// Rolls back only the changes this report applied. If the facility or a route
// was touched by someone else in the meantime (e.g. inspection marked the
// facility MAINTENANCE), the current value no longer matches what this report
// set, so it is left untouched.
const rollbackEffects = (
  report: BarrierReport,
  facility: AccessibleFacility | null,
  routes: RoutePlan[]
): { facility: AccessibleFacility | null; routes: RoutePlan[] } => {
  const effects = report.applied_effects;
  if (!effects) return { facility, routes };
  const nextFacility =
    facility && facility.status === effects.facility_applied_status
      ? { ...facility, status: effects.facility_prev_status }
      : facility;
  const nextRoutes = routes.map((route) => {
    const change = effects.route_changes.find((item) => item.route_id === route.id);
    return change && route.risk_level === change.applied_risk ? { ...route, risk_level: change.prev_risk } : route;
  });
  return { facility: nextFacility, routes: nextRoutes };
};

export function reviewReportWorkflow(input: ReviewWorkflowInput): ReviewWorkflowResult {
  const { report, action, operator, now } = input;
  const targetStatus = ReviewActionToStatus[action];
  // A pending report accepts any decision; an approved report can still be
  // rejected or closed (rolling back its effects). Everything else is a
  // repeated handling attempt: report the current state, change nothing.
  const canTransition =
    report.verify_status === "PENDING" ||
    (report.verify_status === "APPROVED" && (action === "REJECT" || action === "CLOSE"));
  if (!canTransition) {
    return { report, facility: input.facility, routes: input.routes, changed: false };
  }
  let facility = input.facility;
  let routes = input.routes;
  let appliedEffects: BarrierReportEffects | null = report.applied_effects;
  if (action === "APPROVE") {
    const applied = applyEffects(report, facility, routes);
    facility = applied.facility;
    routes = applied.routes;
    appliedEffects = applied.effects;
  } else if (report.verify_status === "APPROVED") {
    const rolledBack = rollbackEffects(report, facility, routes);
    facility = rolledBack.facility;
    routes = rolledBack.routes;
    appliedEffects = null;
  }
  return {
    report: { ...report, verify_status: targetStatus, handled_by: operator, handled_at: now, applied_effects: appliedEffects },
    facility,
    routes,
    changed: true
  };
}
