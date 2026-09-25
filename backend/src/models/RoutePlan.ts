export interface RoutePlan {
  id: number;
  user_id: number;
  origin_text: string;
  destination_text: string;
  route_mode: string;
  risk_level: string;
  estimated_minutes: number;
  facility_ids: number[];
  created_at: string;
  /** 首次被通过的工单波及前的基线风险，关闭最后一张有效工单时回退到它 */
  base_risk_level?: string;
}
