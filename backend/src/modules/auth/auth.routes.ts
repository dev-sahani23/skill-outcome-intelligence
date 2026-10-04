import { Router } from "express";
import * as authController from "./auth.controller";
import { validateRequest } from "../../middleware/validate";
import { requireAuth } from "../../middleware/auth";
import { loginSchema, registerSchema, sendOtpSchema, verifyOtpSchema, changePasswordSchema, resetPasswordSchema } from "./auth.schema";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { normalizeEmail } from "../../utils/normalizeEmail";

// In-memory store (default) — 0 Redis commands per request.
// The OTP value itself is stored in Redis with a 5-attempt Lua guard in auth.service.ts,
// so a Redis-backed rate limiter here would be redundant.
const otpRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 OTP requests per 15 minutes per email
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const emailKey = req.body.email ? normalizeEmail(req.body.email) : undefined;
    return `ratelimit:send-otp:${emailKey || ipKeyGenerator(req.ip || "unknown")}`;
  },
  message: { error: "Too many OTP requests from this email address, please try again after 15 minutes" },
});

const otpCooldownLimiter = rateLimit({
  windowMs: 30 * 1000, // 30 seconds
  max: 1, // 1 OTP per 30-second window (enforces true cooldown)
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const emailKey = req.body.email ? normalizeEmail(req.body.email) : undefined;
    return `ratelimit:send-otp-cooldown:${emailKey || ipKeyGenerator(req.ip || "unknown")}`;
  },
  message: { error: "Please wait 30 seconds before requesting another OTP" },
});

const verifyOtpRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 verification attempts per 15-minute window
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const emailKey = req.body.email ? normalizeEmail(req.body.email) : undefined;
    return `ratelimit:verify-otp:${emailKey || ipKeyGenerator(req.ip || "unknown")}`;
  },
  message: { error: "Too many verification attempts, please request a new OTP later", code: "OTP_ATTEMPTS_EXCEEDED" },
});

const router = Router();

router.post("/register", validateRequest(registerSchema), authController.register);
router.post("/login", validateRequest(loginSchema), authController.login);
router.post("/logout", requireAuth, authController.logout);
router.get("/me", requireAuth, authController.getMe);
router.post("/forgot-password/send-otp", validateRequest(sendOtpSchema), otpRateLimiter, otpCooldownLimiter, authController.sendOtp);
router.post("/forgot-password/verify-otp", validateRequest(verifyOtpSchema), verifyOtpRateLimiter, authController.verifyOtp);
router.post("/forgot-password/reset-password", validateRequest(resetPasswordSchema), authController.resetPassword);
router.post("/change-password", requireAuth, validateRequest(changePasswordSchema), authController.changePassword);

export default router;
