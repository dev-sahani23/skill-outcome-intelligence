import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth";
import { verifyKyc, createContact, getContacts, updateContact } from "./trainee.controller";
import { updateLocation } from "./trainee.location";

const router = Router();

// Only TRAINEE role should be able to perform their own KYC and manage contacts
router.post("/kyc", requireAuth, requireRole(["TRAINEE"]), verifyKyc);

router.post("/contacts", requireAuth, requireRole(["TRAINEE"]), createContact);
router.get("/contacts", requireAuth, requireRole(["TRAINEE"]), getContacts);
router.patch("/contacts/:id", requireAuth, requireRole(["TRAINEE"]), updateContact);

router.post("/location", requireAuth, requireRole(["TRAINEE"]), updateLocation);

export default router;
