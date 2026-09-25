import { Router } from "express";
import { barrierReportController } from "../controllers/BarrierReportController";
import { rbacMiddleware } from "../middlewares/rbacMiddleware";

const router = Router();

router.get("/", barrierReportController.list);
router.post("/", barrierReportController.create);
// 审核动作限审核员/管理员，重复处理也走同一入口保证幂等返回。
router.post(
  "/:id/review",
  rbacMiddleware(["admin", "auditor", "facility_manager"]),
  barrierReportController.review
);

export default router;
