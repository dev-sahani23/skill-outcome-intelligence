import { z } from "zod";
import { Request } from "express";

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
});

export type PaginationParams = z.infer<typeof paginationSchema>;

export const parsePagination = (req: Request): PaginationParams => {
  return paginationSchema.parse(req.query);
};

export const getPaginationMeta = (total: number, page: number, limit: number) => {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};
