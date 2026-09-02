import jwt from "jsonwebtoken";
import { env } from "../config/env";

export const signToken = (payload: object, expiresIn: string | number = "15m") => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: expiresIn as any });
};

export const verifyToken = <T>(token: string): T => {
  return jwt.verify(token, env.JWT_SECRET) as T;
};
