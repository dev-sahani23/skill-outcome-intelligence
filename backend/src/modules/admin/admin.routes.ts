import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth";
import { postSkillGapReport } from "./admin.controller";

const router = Router();

// Only GOVERNMENT_ADMIN role should be able to create skill gap reports
router.post("/skill-gap", requireAuth, requireRole(["GOVERNMENT_ADMIN"]), postSkillGapReport);

export default router;
