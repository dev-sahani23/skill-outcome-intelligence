import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("5000"),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  GOVT_ID_HASH_PEPPER: z.string().default("default-local-pepper-for-govt-id"),
});

export const env = envSchema.parse(process.env);
