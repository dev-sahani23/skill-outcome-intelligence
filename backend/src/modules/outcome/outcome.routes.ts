import { Router } from "express";
import * as outcomeController from "./outcome.controller";
import { validateRequest } from "../../middleware/validate";
import { requireAuth, requireRole } from "../../middleware/auth";
import { createOutcomeSchema } from "./outcome.schema";

const router = Router();

router.get("/my-outcomes", requireAuth, requireRole(["TRAINEE"]), outcomeController.getMyOutcomes);
router.post("/", requireAuth, requireRole(["TRAINEE"]), validateRequest(createOutcomeSchema), outcomeController.create);

export default router;
