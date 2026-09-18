import { Router } from "express";
import { getDistricts, searchEmployers } from "./public.controller";

const router = Router();

router.get("/districts", getDistricts);
router.get("/employers/search", searchEmployers);

export default router;
