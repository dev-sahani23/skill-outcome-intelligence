import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);
  
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";

  // Handle Prisma unique constraint violations
  if (err.code === "P2002") {
    statusCode = 400;
    const target = err.meta?.target || "field";
    message = `Unique constraint failed on the ${target}. This record already exists.`;
  }
  
  const response: any = { error: message };
  if (err.errorCode) {
    response.code = err.errorCode;
  }
  
  res.status(statusCode).json(response);
};
