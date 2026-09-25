export const LOG_TEMPLATES = {
  UserProfile: ["UserProfile.create", "UserProfile.update", "UserProfile.status", "UserProfile.export"],
  AccessibleFacility: ["AccessibleFacility.create", "AccessibleFacility.update", "AccessibleFacility.status", "AccessibleFacility.export", "AccessibleFacility.inspect"],
  RoutePlan: ["RoutePlan.create", "RoutePlan.update", "RoutePlan.status", "RoutePlan.export", "RoutePlan.riskRaisedByBarrier"],
  AssistanceRequest: ["AssistanceRequest.create", "AssistanceRequest.update", "AssistanceRequest.status", "AssistanceRequest.export"],
  BarrierReport: ["BarrierReport.create", "BarrierReport.update", "BarrierReport.status", "BarrierReport.export", "BarrierReport.review.approve", "BarrierReport.review.rollback", "BarrierReport.review.noop"]
};
