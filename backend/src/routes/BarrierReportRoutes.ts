import { Router } from "express";
import { barrierReportController } from "../controllers/BarrierReportController";

const router = Router();
router.get("/", barrierReportController.list);
router.post("/", barrierReportController.create);
router.post("/:id/review", barrierReportController.review);
export default router;
