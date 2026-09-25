import { Router } from "express";
import { accessibleFacilityController } from "../controllers/AccessibleFacilityController";
import { rbacMiddleware } from "../middlewares/rbacMiddleware";

const router = Router();

router.get("/", accessibleFacilityController.list);
router.post("/", accessibleFacilityController.create);
// 巡检状态更新限设施管理员/审核员。
router.patch(
  "/:id/status",
  rbacMiddleware(["admin", "facility_manager", "auditor"]),
  accessibleFacilityController.updateStatus
);

export default router;
