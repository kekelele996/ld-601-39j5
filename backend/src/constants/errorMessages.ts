export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "missing bearer token",
  RBAC_DENIED: "role denied",
  VALIDATION_FAILED: "invalid payload",
  RATE_LIMITED: "too many requests",
  REPORT_NOT_FOUND: "barrier report not found",
  REPORT_ALREADY_PROCESSED: "barrier report already processed, current status and handler are returned",
  REPORT_ACTION_INVALID: "review action must be one of approve/reject/close",
  FACILITY_NOT_FOUND: "accessible facility not found",
  FACILITY_STATUS_INVALID: "facility status must be one of AVAILABLE/BLOCKED/MAINTENANCE/UNKNOWN"
};
