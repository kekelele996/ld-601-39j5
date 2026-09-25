import { accessibleFacilityRepository } from "../repositories/AccessibleFacilityRepository";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { FacilityStatus } from "../constants/FacilityStatus";
import type { AccessibleFacility } from "../models/AccessibleFacility";

const httpError = (status: number, code: keyof typeof ERROR_CODES) =>
  Object.assign(new Error(ERROR_MESSAGES[code]), { status, code });

export const accessibleFacilityService = {
  list: () => accessibleFacilityRepository.findAll(),
  create: (row: unknown) => accessibleFacilityRepository.save(row as AccessibleFacility),
  updateStatus(id: number, status: string) {
    if (!(FacilityStatus as readonly string[]).includes(status)) {
      throw httpError(400, "INVALID_FACILITY_STATUS");
    }
    const facility = accessibleFacilityRepository.findById(id);
    if (!facility) {
      throw httpError(404, "FACILITY_NOT_FOUND");
    }
    const updated = accessibleFacilityRepository.updateStatus(id, status, new Date().toISOString());
    console.info(LOG_TEMPLATES.AccessibleFacility[4], `facility#${id}`, status);
    return updated;
  }
};
