import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth";
import { recordTrainingDetails, getMyEnrollments, getProviderEnrollments } from "./enrollment.controller";

const router = Router();

// Trainee routes
router.post("/record-details", requireAuth, requireRole(["TRAINEE"]), recordTrainingDetails);
router.get("/my-enrollments", requireAuth, requireRole(["TRAINEE"]), getMyEnrollments);

// Provider routes
router.get("/provider-enrollments", requireAuth, requireRole(["PROVIDER"]), getProviderEnrollments);

export default router;
