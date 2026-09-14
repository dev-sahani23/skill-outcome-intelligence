import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth";
import { postSkillGapReport, getStats, getSkillAssessments } from "./admin.controller";

const router = Router();

// Only GOVERNMENT_ADMIN role should be able to create skill gap reports
router.post("/skill-gap", requireAuth, requireRole(["GOVERNMENT_ADMIN"]), postSkillGapReport);

// Stats are readable by any authenticated admin
router.get("/stats", requireAuth, requireRole(["GOVERNMENT_ADMIN"]), getStats);

// Skill Assessments aggregate view
router.get("/skill-assessments", requireAuth, requireRole(["GOVERNMENT_ADMIN"]), getSkillAssessments);

export default router;
