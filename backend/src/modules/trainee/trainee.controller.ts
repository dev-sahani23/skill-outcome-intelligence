import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { hashGovtId, getLastFour } from "../../utils/govtIdHash";

/**
 * KYC Endpoint for Trainees.
 * SECURITY: Raw Aadhaar must only exist in memory during KYC processing.
 * Never persist, log, cache, or return the raw value.
 */
export const verifyKyc = async (req: Request, res: Response) => {
  try {
    const traineeId = req.user?.id; // Assumes requireAuth sets req.user.id
    if (!traineeId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { aadhaar } = req.body;
    if (!aadhaar || typeof aadhaar !== "string") {
      return res.status(400).json({ error: "Missing or invalid government ID" });
    }

    let aadhaarHash: string;
    let aadhaarLast4: string;
    try {
      aadhaarHash = hashGovtId(aadhaar);
      aadhaarLast4 = getLastFour(aadhaar);
    } catch (err: any) {
      return res.status(400).json({ error: err.message || "Invalid government ID format" });
    }

    const traineeProfile = await prisma.traineeProfile.findUnique({
      where: { userId: traineeId }
    });

    if (!traineeProfile) {
      return res.status(404).json({ error: "Trainee profile not found" });
    }

    await prisma.traineeProfile.update({
      where: { id: traineeProfile.id },
      data: {
        aadhaarHash,
        aadhaarLast4
      }
    });

    console.log({
      event: "KYC_VERIFICATION_SUCCESS",
      traineeId: traineeProfile.id,
      timestamp: new Date().toISOString()
    });

    return res.status(200).json({ message: "KYC verification successful" });
  } catch (error: any) {
    console.error({
      event: "KYC_VERIFICATION_ERROR",
      userId: req.user?.id,
      error: error.message
    });
    return res.status(500).json({ error: "Internal server error during KYC verification" });
  }
};

export const createContact = async (req: Request, res: Response) => {
  try {
    const traineeProfile = await prisma.traineeProfile.findUnique({ where: { userId: req.user?.id } });
    if (!traineeProfile) return res.status(404).json({ error: "Profile not found" });

    const { contactType, name, phone, relationship, priorityOrder } = req.body;

    const contact = await prisma.contact.create({
      data: {
        traineeId: traineeProfile.id,
        contactType,
        name,
        phone,
        relationship,
        priorityOrder
      }
    });
    return res.status(201).json({ contact });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: "Priority order must be unique per trainee" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getContacts = async (req: Request, res: Response) => {
  try {
    const traineeProfile = await prisma.traineeProfile.findUnique({ where: { userId: req.user?.id } });
    if (!traineeProfile) return res.status(404).json({ error: "Profile not found" });

    const contacts = await prisma.contact.findMany({
      where: { traineeId: traineeProfile.id },
      orderBy: { priorityOrder: "asc" }
    });
    return res.status(200).json({ contacts });
  } catch (error: any) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const updateContact = async (req: Request, res: Response) => {
  try {
    const traineeProfile = await prisma.traineeProfile.findUnique({ where: { userId: req.user?.id } });
    if (!traineeProfile) return res.status(404).json({ error: "Profile not found" });
    const id = req.params.id as string;
    const { contactType, name, phone, relationship, priorityOrder, isActive } = req.body;

    // Verify contact belongs to this trainee
    const existing = await prisma.contact.findFirst({
      where: { id, traineeId: traineeProfile.id }
    });
    if (!existing) return res.status(404).json({ error: "Contact not found" });

    const contact = await prisma.contact.update({
      where: { id },
      data: {
        contactType,
        name,
        phone,
        relationship,
        priorityOrder,
        isActive
      }
    });
    return res.status(200).json({ contact });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: "Priority order must be unique per trainee" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
};
