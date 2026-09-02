import { Request, Response, NextFunction } from "express";
import * as outcomeService from "./outcome.service";

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const outcome = await outcomeService.createOutcome(req.user!.id, req.body);
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
