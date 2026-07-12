import { z } from "zod/v4";
import { Priority } from "@prisma/client";

/**
 * Validator schema for raising a maintenance request
 */
export const raiseRequestSchema = z.object({
  assetId: z.string().min(1, "Asset ID is required"),
  issue: z.string().min(10, "Issue description must be at least 10 characters"),
  priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
  photoUrl: z.string().url("Invalid photo URL format").or(z.string().length(0)).optional(),
});

/**
 * Validator schema for assigning a technician
 */
export const assignTechnicianSchema = z.object({
  technicianId: z.string().min(1, "Technician ID is required"),
});

/**
 * Validator schema for resolving a request
 */
export const resolveRequestSchema = z.object({
  notes: z.string().min(5, "Resolution notes must be at least 5 characters"),
});
