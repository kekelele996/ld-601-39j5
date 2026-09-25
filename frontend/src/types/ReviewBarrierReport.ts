export type ReviewAction = "approve" | "reject" | "close";

export interface ReviewBarrierReportPayload {
  action: ReviewAction;
  reviewer?: string;
  review_note?: string;
}

export interface ReviewBarrierReportResult {
  report: import("./BarrierReport").BarrierReport;
  facilities: import("./AccessibleFacility").AccessibleFacility[];
  routes: import("./RoutePlan").RoutePlan[];
  /** false 表示工单此前已处理，本次为重复提交，状态/处理人仅回显 */
  changed: boolean;
}
