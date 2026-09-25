export interface AccessibleFacility {
  id: number;
  facility_type: string;
  name: string;
  location_code: string;
  floor: string;
  status: string;
  last_checked_at: string;
  owner_department: string;
  note: string;
  /** 首次被工单通过时锁定的基线状态，关闭最后一张有效工单时回退到它 */
  base_status?: string;
}
