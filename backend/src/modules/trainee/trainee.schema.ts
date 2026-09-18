import { z } from "zod";
import { ContactType } from "@prisma/client";

export const createContactSchema = z.object({
  contactType: z.nativeEnum(ContactType),
  name: z.string().min(1),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian mobile number"),
  relationship: z.string().optional(),
  priorityOrder: z.number().int().min(1)
});

export const updateContactSchema = createContactSchema.partial().extend({
  isActive: z.boolean().optional()
});
