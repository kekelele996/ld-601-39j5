import { barrierReportRepository } from "../repositories/BarrierReportRepository";
import { accessibleFacilityRepository } from "../repositories/AccessibleFacilityRepository";
import { routePlanRepository } from "../repositories/RoutePlanRepository";
import { reviewBarrierReport, rollbackApprovedReport } from "../utils/barrierReview";
import type { ReviewResult } from "../utils/barrierReview";
import { ServiceError } from "../utils/serviceError";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { toAuditTarget } from "../utils/formatters";
import type { BarrierReportReviewPayload } from "../types/BarrierReportReviewPayload";

const persistCollections = (result: ReviewResult) => {
  result.facilities.forEach((row) => accessibleFacilityRepository.save(row));
  result.routes.forEach((row) => routePlanRepository.save(row));
  barrierReportRepository.save(result.report);
};

export const barrierReportService = {
  list: () => barrierReportRepository.findAll(),

  create: (row: unknown) => barrierReportRepository.save(row as never),

  /**
   * 审核障碍工单。
   * 返回值 changed=false 表示该工单此前已处理，本次为重复请求，仅回显当前状态与处理人。
   */
  review: (id: number, payload: BarrierReportReviewPayload, reviewer: string): ReviewResult => {
    const current = barrierReportRepository.findById(id);
    if (!current) {
      throw new ServiceError("REPORT_NOT_FOUND", 404);
    }

    const action = payload?.action;
    if (!["approve", "reject", "close"].includes(action)) {
      throw new ServiceError("REPORT_ACTION_INVALID", 400);
    }

    const input = {
      action,
      reviewer: reviewer || payload?.reviewer || "审核员",
      review_note: payload?.review_note
    };

    const snapshot = {
      reports: barrierReportRepository.findAll(),
      facilities: accessibleFacilityRepository.findAll(),
      routes: routePlanRepository.findAll()
    };

    // APPROVED + close 走回退；其余动作（含对已处理工单的重复处理）走统一审核引擎。
    const result =
      current.verify_status === "APPROVED" && action === "close"
        ? rollbackApprovedReport(id, input, snapshot)
        : reviewBarrierReport(id, input, snapshot);

    if (!result.changed) {
      // 重复处理：抛出携带当前状态与处理人的业务异常，由控制器包装成 409 响应。
      const error = new ServiceError("REPORT_ALREADY_PROCESSED", 409);
      (error as Error & { review?: ReviewResult }).review = result;
      throw error;
    }

    persistCollections(result);

    console.info(
      LOG_TEMPLATES.BarrierReport[action === "approve" ? 4 : action === "reject" ? 5 : 6],
      toAuditTarget("BarrierReport", id),
      input.reviewer
    );

    return result;
  }
};
