import { barrierReportRepository } from "../repositories/BarrierReportRepository";
import { accessibleFacilityRepository } from "../repositories/AccessibleFacilityRepository";
import { routePlanRepository } from "../repositories/RoutePlanRepository";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { ReviewAction, ReviewActionToStatus, FACILITY_DISABLED_STATUS, ROUTE_RISK_ON_BARRIER } from "../constants/BarrierReportStatus";
import type { BarrierReport, BarrierReportEffects } from "../models/BarrierReport";
import type { AccessibleFacility } from "../models/AccessibleFacility";
import type { RoutePlan } from "../models/RoutePlan";

export interface BarrierReportReviewResult {
  report: BarrierReport;
  facility: AccessibleFacility | null;
  routes: RoutePlan[];
  changed: boolean;
}

const httpError = (status: number, code: keyof typeof ERROR_CODES) =>
  Object.assign(new Error(ERROR_MESSAGES[code]), { status, code });

const affectedRoutes = (facilityId: number) => routePlanRepository.findByFacilityId(facilityId);

// Approving snapshots the current facility status and route risk levels so a
// later reject/close can roll back exactly what this report changed.
const applyEffects = (report: BarrierReport): BarrierReportEffects => {
  const facility = accessibleFacilityRepository.findById(report.facility_id);
  const routes = affectedRoutes(report.facility_id);
  const effects: BarrierReportEffects = {
    facility_prev_status: facility?.status ?? "UNKNOWN",
    facility_applied_status: FACILITY_DISABLED_STATUS,
    route_changes: routes.map((route) => ({ route_id: route.id, prev_risk: route.risk_level, applied_risk: ROUTE_RISK_ON_BARRIER }))
  };
  if (facility) {
    accessibleFacilityRepository.updateStatus(facility.id, FACILITY_DISABLED_STATUS, new Date().toISOString());
    console.info(LOG_TEMPLATES.AccessibleFacility[2], `facility#${facility.id}`, `${effects.facility_prev_status}->${FACILITY_DISABLED_STATUS}`);
  }
  for (const route of routes) {
    routePlanRepository.updateRisk(route.id, ROUTE_RISK_ON_BARRIER);
    console.info(LOG_TEMPLATES.RoutePlan[4], `route#${route.id}`, `report#${report.id}`);
  }
  return effects;
};

// Rolls back only the changes this report applied. If the facility or a route
// was touched by someone else in the meantime (e.g. inspection marked the
// facility MAINTENANCE), the current value no longer matches what this report
// set, so it is left untouched.
const rollbackEffects = (report: BarrierReport) => {
  const effects = report.applied_effects;
  if (!effects) return;
  const facility = accessibleFacilityRepository.findById(report.facility_id);
  if (facility && facility.status === effects.facility_applied_status) {
    accessibleFacilityRepository.updateStatus(facility.id, effects.facility_prev_status, new Date().toISOString());
    console.info(LOG_TEMPLATES.AccessibleFacility[2], `facility#${facility.id}`, `${effects.facility_applied_status}->${effects.facility_prev_status}`);
  }
  for (const change of effects.route_changes) {
    const route = routePlanRepository.findById(change.route_id);
    if (route && route.risk_level === change.applied_risk) {
      routePlanRepository.updateRisk(route.id, change.prev_risk);
    }
  }
};

export const barrierReportService = {
  list: () => barrierReportRepository.findAll(),
  create: (row: unknown) => barrierReportRepository.save(row as BarrierReport),
  review(id: number, action: string, operator: string): BarrierReportReviewResult {
    if (!(ReviewAction as readonly string[]).includes(action)) {
      throw httpError(400, "INVALID_REVIEW_ACTION");
    }
    const report = barrierReportRepository.findById(id);
    if (!report) {
      throw httpError(404, "REPORT_NOT_FOUND");
    }
    const reviewAction = action as ReviewAction;
    const targetStatus = ReviewActionToStatus[reviewAction];
    // A pending report accepts any decision; an approved report can still be
    // rejected or closed (rolling back its effects). Everything else is a
    // repeated handling attempt: report the current state, change nothing.
    const canTransition =
      report.verify_status === "PENDING" ||
      (report.verify_status === "APPROVED" && (reviewAction === "REJECT" || reviewAction === "CLOSE"));
    if (!canTransition) {
      console.info(LOG_TEMPLATES.BarrierReport[6], `report#${id}`, report.verify_status, report.handled_by ?? "-");
      return {
        report,
        facility: accessibleFacilityRepository.findById(report.facility_id),
        routes: affectedRoutes(report.facility_id),
        changed: false
      };
    }
    let appliedEffects: BarrierReportEffects | null = report.applied_effects;
    if (reviewAction === "APPROVE") {
      appliedEffects = applyEffects(report);
      console.info(LOG_TEMPLATES.BarrierReport[4], `report#${id}`, operator);
    } else if (report.verify_status === "APPROVED") {
      rollbackEffects(report);
      appliedEffects = null;
      console.info(LOG_TEMPLATES.BarrierReport[5], `report#${id}`, operator);
    }
    const updated = barrierReportRepository.update(id, {
      verify_status: targetStatus,
      handled_by: operator,
      handled_at: new Date().toISOString(),
      applied_effects: appliedEffects
    }) as BarrierReport;
    console.info(LOG_TEMPLATES.BarrierReport[2], `report#${id}`, targetStatus);
    return {
      report: updated,
      facility: accessibleFacilityRepository.findById(report.facility_id),
      routes: affectedRoutes(report.facility_id),
      changed: true
    };
  }
};
