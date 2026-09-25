import type { NextFunction, Request, Response } from "express";
import { barrierReportService } from "../services/BarrierReportService";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";

export const barrierReportController = {
  list: (_req: Request, res: Response) => res.json(barrierReportService.list()),
  create: (req: Request, res: Response) => res.status(201).json(barrierReportService.create(req.body)),
  review: (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const { action, operator } = req.body ?? {};
      const handler = typeof operator === "string" && operator.trim() ? operator.trim() : `user#${(req as any).user?.id ?? "unknown"}`;
      res.json(barrierReportService.review(id, action, handler));
    } catch (err) {
      // Controller re-wraps service errors so the layer origin stays visible.
      const error = err as Error & { status?: number; code?: string };
      next(Object.assign(error, {
        status: error.status ?? 500,
        code: error.code ?? ERROR_CODES.VALIDATION_FAILED,
        message: error.message || ERROR_MESSAGES.VALIDATION_FAILED
      }));
    }
  }
};
