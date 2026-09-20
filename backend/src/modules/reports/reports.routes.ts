import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import {
  getTraineeReportController,
  getCourseReportController,
  getProviderReportController,
  getSystemReportController
} from "./reports.controller";

const router = Router();

// All reports require authentication
router.use(requireAuth);

router.get("/trainee/:traineeId", getTraineeReportController);
router.get("/course/:courseId", getCourseReportController);
router.get("/provider/:providerId", getProviderReportController);
router.get("/system", getSystemReportController);

export default router;
