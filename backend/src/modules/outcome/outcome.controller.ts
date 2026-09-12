import { Request, Response, NextFunction } from "express";
import * as outcomeService from "./outcome.service";
import { hashGovtId, getLastFour } from "../../utils/govtIdHash";
import { prisma } from "../../lib/prisma";

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = { ...req.body };

    // If trainee provides raw Aadhaar, hash it in memory and persist it on the profile.
    // The raw value is never forwarded to the service layer or DB.
    if (body.aadhaarNo) {
      try {
        const aadhaarHash = hashGovtId(body.aadhaarNo);
        const aadhaarLast4 = getLastFour(body.aadhaarNo);

        const trainee = await prisma.traineeProfile.findUnique({
          where: { userId: req.user!.id }
        });
        if (trainee) {
          await prisma.traineeProfile.update({
            where: { id: trainee.id },
            data: { aadhaarHash, aadhaarLast4 },
          });
        }
      } catch (hashErr: any) {
        return res.status(400).json({ error: hashErr.message || "Invalid Aadhaar format" });
      }
      // Raw aadhaarNo is accepted by schema but dropped by service before the DB insert
    }

    const outcome = await outcomeService.createOutcome(req.user!.id, body);
    res.status(201).json(outcome);
  } catch (error) {
    next(error);
  }
};

export const getMyOutcomes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const outcomes = await outcomeService.getMyOutcomes(req.user!.id);
    res.status(200).json(outcomes);
  } catch (error) {
    next(error);
  }
};
