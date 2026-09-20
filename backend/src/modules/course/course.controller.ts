import { Request, Response, NextFunction } from "express";

import { parsePagination, getPaginationMeta } from "../../utils/pagination";
import * as courseService from "./course.service";

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const course = await courseService.createCourse(req.user!.id, req.body);
    res.status(201).json(course);
  } catch (error) {
    next(error);
  }
};

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const courses = await courseService.getAllCourses();
    res.status(200).json(courses);
  } catch (error) {
    next(error);
  }
};

export const getMyCourses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, search } = parsePagination(req);
    const { data, total } = await courseService.getProviderCourses(req.user!.id, page, limit, search);
    res.status(200).json({ data, meta: getPaginationMeta(total, page, limit) });
  } catch (error) {
    next(error);
  }
};
