export interface RouteRiskChange {
  route_id: number;
  prev_risk: string;
  applied_risk: string;
}

export interface BarrierReportEffects {
  facility_prev_status: string;
  facility_applied_status: string;
  route_changes: RouteRiskChange[];
}

export interface BarrierReport {
  id: number;
  reporter_id: number;
  facility_id: number;
  barrier_type: string;
  description: string;
  photo_url: string;
  verify_status: string;
  priority: string;
  handled_by: string | null;
  handled_at: string | null;
  applied_effects: BarrierReportEffects | null;
}
