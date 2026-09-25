export interface BarrierReport {
  id: number;
  reporter_id: number;
  facility_id: number;
  barrier_type: string;
  description: string;
  photo_url: string;
  verify_status: string;
  priority: string;
  reviewer?: string;
  reviewed_at?: string;
  review_note?: string;
  affected_route_ids?: number[];
}
