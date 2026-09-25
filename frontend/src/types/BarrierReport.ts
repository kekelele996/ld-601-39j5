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
  /** 通过时受影响的路线 id 列表，供路线页/工单详情展示 */
  affected_route_ids?: number[];
}
