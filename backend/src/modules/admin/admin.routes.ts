import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth";
import { postSkillGapReport, getStats } from "./admin.controller";

const router = Router();

// Only GOVERNMENT_ADMIN role should be able to create skill gap reports
router.post("/skill-gap", requireAuth, requireRole(["GOVERNMENT_ADMIN"]), postSkillGapReport);

// Stats are readable by any authenticated admin
router.get("/stats", requireAuth, requireRole(["GOVERNMENT_ADMIN"]), getStats);

export default router;
