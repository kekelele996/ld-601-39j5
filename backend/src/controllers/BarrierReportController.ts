import type { Request, Response, NextFunction } from "express";
import { barrierReportService } from "../services/BarrierReportService";
import type { ReviewResult } from "../utils/barrierReview";
import type { BarrierReportReviewPayload } from "../types/BarrierReportReviewPayload";

type AuthedRequest = Request & { user?: { id: number; role: string } };

const reviewerName = (req: AuthedRequest) =>
  (req.body as BarrierReportReviewPayload)?.reviewer || `审核员-${req.user?.id ?? 1}`;

const envelope = (result: ReviewResult) => ({
  report: result.report,
  facilities: result.facilities,
  routes: result.routes
});

export const barrierReportController = {
  list: (_req: Request, res: Response) => res.json(barrierReportService.list()),

  create: (req: Request, res: Response) =>
    res.status(201).json(barrierReportService.create(req.body)),

  // 控制器层再包一层异常：重复处理时 409 仍要把当前状态与处理人带给前端。
  review: (req: AuthedRequest, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const result = barrierReportService.review(
        id,
        req.body as BarrierReportReviewPayload,
        reviewerName(req)
      );
      res.json(envelope(result));
    } catch (error) {
      const processed = error as Error & {
        status?: number;
        code?: string;
        review?: ReviewResult;
      };
      if (processed.code === "REPORT_ALREADY_PROCESSED" && processed.review) {
        res.status(processed.status ?? 409).json({
          code: processed.code,
          message: processed.message,
          ...envelope(processed.review)
        });
        return;
      }
      next(error);
    }
  }
};
