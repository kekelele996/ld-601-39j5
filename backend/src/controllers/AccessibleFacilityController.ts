import type { NextFunction, Request, Response } from "express";
import { accessibleFacilityService } from "../services/AccessibleFacilityService";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";

export const accessibleFacilityController = {
  list: (_req: Request, res: Response) => res.json(accessibleFacilityService.list()),
  create: (req: Request, res: Response) => res.status(201).json(accessibleFacilityService.create(req.body)),
  updateStatus: (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const { status } = req.body ?? {};
      res.json(accessibleFacilityService.updateStatus(id, status));
    } catch (err) {
      const error = err as Error & { status?: number; code?: string };
      next(Object.assign(error, {
        status: error.status ?? 500,
        code: error.code ?? ERROR_CODES.VALIDATION_FAILED,
        message: error.message || ERROR_MESSAGES.VALIDATION_FAILED
      }));
    }
  }
};
