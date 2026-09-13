import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyToken<{ id: string; role: any; mustChangePassword?: boolean }>(token);
    
    // Check for mandatory password change
    // Allow if it's the change-password route itself or logout
    const isExemptRoute = req.path === "/change-password" || req.path === "/logout";
    if (payload.mustChangePassword && !isExemptRoute) {
      return res.status(403).json({ error: "You must change your temporary password before continuing", code: "PASSWORD_CHANGE_REQUIRED" });
    }
    
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden: insufficient permissions" });
    }
    next();
  };
};
