import type { Request, Response, NextFunction } from "express";
import { accessibleFacilityService } from "../services/AccessibleFacilityService";

type AuthedRequest = Request & { user?: { id: number; role: string } };

export const accessibleFacilityController = {
  list: (_req: Request, res: Response) => res.json(accessibleFacilityService.list()),

  create: (req: Request, res: Response) =>
    res.status(201).json(accessibleFacilityService.create(req.body)),

  // 巡检标记状态（如维修），service 抛出的业务异常交给全局错误处理器。
  updateStatus: (req: AuthedRequest, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const status = String((req.body as { status?: string })?.status ?? "");
      res.json(accessibleFacilityService.updateStatus(id, status));
    } catch (error) {
      next(error);
    }
  }
};
