import { Request, Response, NextFunction } from "express";
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
    const courses = await courseService.getProviderCourses(req.user!.id);
    res.status(200).json(courses);
  } catch (error) {
    next(error);
  }
};
