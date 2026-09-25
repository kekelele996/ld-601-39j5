import { accessibleFacilityRepository } from "../repositories/AccessibleFacilityRepository";
import { ServiceError } from "../utils/serviceError";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { toAuditTarget } from "../utils/formatters";
import type { AccessibleFacility } from "../models/AccessibleFacility";

const FACILITY_STATUSES = ["AVAILABLE", "BLOCKED", "MAINTENANCE", "UNKNOWN"];

export const accessibleFacilityService = {
  list: () => accessibleFacilityRepository.findAll(),

  create: (row: unknown) => accessibleFacilityRepository.save(row as AccessibleFacility),

  /**
   * 巡检状态更新。标记为 MAINTENANCE 是巡检的独立动作：
   * 即使之后关联工单关闭回退，设施仍保持维修状态。
   */
  updateStatus: (id: number, status: string) => {
    if (!FACILITY_STATUSES.includes(status)) {
      throw new ServiceError("FACILITY_STATUS_INVALID", 400);
    }
    const facility = accessibleFacilityRepository.findById(id);
    if (!facility) {
      throw new ServiceError("FACILITY_NOT_FOUND", 404);
    }
    const updated: AccessibleFacility = {
      ...facility,
      status,
      last_checked_at: new Date().toISOString()
    };
    accessibleFacilityRepository.save(updated);
    console.info(LOG_TEMPLATES.AccessibleFacility[2], toAuditTarget("AccessibleFacility", id), status);
    return updated;
  }
};
