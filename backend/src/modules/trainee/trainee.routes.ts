import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth";
import { verifyKyc, createContact, getContacts, updateContact } from "./trainee.controller";
import { updateLocation } from "./trainee.location";
import { startAssessment, submitAssessment, getAssessment } from "./skillAssessment.controller";
import { createTrainingRecord, getTrainingRecords } from "./trainingRecord.controller";
import { validateRequest } from "../../middleware/validate";
import { startAssessmentSchema, submitAssessmentSchema } from "./skillAssessment.schema";
import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redisClient } from "../../lib/redis";

const assessmentRateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 3, // limit to 3 assessment attempts per 24 hours
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return `ratelimit:skill-assessment:${req.user?.id || "anonymous"}`;
  },
  store: new RedisStore({
    sendCommand: (...args: string[]) => redisClient.call(args[0], ...args.slice(1)) as any,
  }),
  message: { error: "Too many skill assessment attempts. Please try again tomorrow." },
});
const router = Router();

// Only TRAINEE role should be able to perform their own KYC and manage contacts
router.post("/kyc", requireAuth, requireRole(["TRAINEE"]), verifyKyc);

router.post("/contacts", requireAuth, requireRole(["TRAINEE"]), createContact);
router.get("/contacts", requireAuth, requireRole(["TRAINEE"]), getContacts);
router.patch("/contacts/:id", requireAuth, requireRole(["TRAINEE"]), updateContact);

router.post("/location", requireAuth, requireRole(["TRAINEE"]), updateLocation);

// Skill Assessment routes
router.post(
  "/skill-assessment/start",
  requireAuth,
  requireRole(["TRAINEE"]),
  assessmentRateLimiter,
  validateRequest(startAssessmentSchema),
  startAssessment
);

router.post(
  "/skill-assessment/:id/submit",
  requireAuth,
  requireRole(["TRAINEE"]),
  validateRequest(submitAssessmentSchema),
  submitAssessment
);

router.get(
  "/skill-assessment/:id",
  requireAuth,
  requireRole(["TRAINEE"]),
  getAssessment
);

// Training Records — self-reported training history with Cloudinary certificate uploads
router.post("/training-records", requireAuth, requireRole(["TRAINEE"]), createTrainingRecord);
router.get("/training-records", requireAuth, requireRole(["TRAINEE"]), getTrainingRecords);

export default router;
