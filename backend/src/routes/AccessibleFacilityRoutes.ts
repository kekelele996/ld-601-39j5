import { Router } from "express";
import { accessibleFacilityController } from "../controllers/AccessibleFacilityController";

const router = Router();
router.get("/", accessibleFacilityController.list);
router.post("/", accessibleFacilityController.create);
router.post("/:id/status", accessibleFacilityController.updateStatus);
export default router;
