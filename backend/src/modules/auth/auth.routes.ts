import { Router } from "express";
import * as authController from "./auth.controller";
import { validateRequest } from "../../middleware/validate";
import { requireAuth } from "../../middleware/auth";
import { loginSchema, registerSchema } from "./auth.schema";

const router = Router();

router.post("/register", validateRequest(registerSchema), authController.register);
router.post("/login", validateRequest(loginSchema), authController.login);
router.post("/logout", requireAuth, authController.logout);
router.get("/me", requireAuth, authController.getMe);

export default router;
