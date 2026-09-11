import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth";
import { recordTrainingDetails } from "./enrollment.controller";

const router = Router();

// Endpoint for trainees to record their training details from the popup
router.post("/record-details", requireAuth, requireRole(["TRAINEE"]), recordTrainingDetails);

export default router;
