import { Router } from "express";
import * as courseController from "./course.controller";
import { validateRequest } from "../../middleware/validate";
import { requireAuth, requireRole } from "../../middleware/auth";
import { createCourseSchema } from "./course.schema";

const router = Router();

// Public - any authenticated user can browse courses
router.get("/", requireAuth, courseController.getAll);

// Provider-specific
router.get("/my-courses", requireAuth, requireRole(["PROVIDER"]), courseController.getMyCourses);
router.post("/", requireAuth, requireRole(["PROVIDER"]), validateRequest(createCourseSchema), courseController.create);

export default router;
