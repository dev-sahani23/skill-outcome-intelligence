import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth";
import { postSkillGapReport, getStats, getSkillAssessments, updateAnomalyFlag, getAnomalyFlags, getTrainees, getLocationStats } from "./admin.controller";

const router = Router();

// Only GOVERNMENT_ADMIN role should be able to create skill gap reports
router.post("/skill-gap", requireAuth, requireRole(["GOVERNMENT_ADMIN"]), postSkillGapReport);

// Stats are readable by any authenticated admin
router.get("/stats", requireAuth, requireRole(["GOVERNMENT_ADMIN"]), getStats);

// Skill Assessments aggregate view
router.get("/skill-assessments", requireAuth, requireRole(["GOVERNMENT_ADMIN"]), getSkillAssessments);

// Location Stats
router.get("/location-stats", requireAuth, requireRole(["GOVERNMENT_ADMIN"]), getLocationStats);

// Trainees and Anomaly Flags
router.get("/trainees", requireAuth, requireRole(["GOVERNMENT_ADMIN"]), getTrainees);
router.get("/anomaly-flags", requireAuth, requireRole(["GOVERNMENT_ADMIN"]), getAnomalyFlags);
router.get("/historical-data", requireAuth, requireRole(["GOVERNMENT_ADMIN"]), (req, res) => {
  import("./admin.controller").then(c => c.getHistoricalData(req, res));
});

// Update Anomaly Flag
router.patch("/anomaly-flags/:id", requireAuth, requireRole(["GOVERNMENT_ADMIN"]), updateAnomalyFlag);

// Send Follow Up immediately
router.post("/follow-ups/:id/send-now", requireAuth, requireRole(["GOVERNMENT_ADMIN"]), (req, res) => {
  import("./admin.controller").then(c => c.sendFollowUpNow(req, res));
});

export default router;
