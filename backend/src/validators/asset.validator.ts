import { z } from "zod/v4";
import { AssetStatus } from "@prisma/client";

// ─── Asset Condition Object ─────────────────────────────────

export const AssetCondition = {
  Good: "Good",
  Fair: "Fair",
  Poor: "Poor",
} as const;

export type AssetCondition = keyof typeof AssetCondition;

// ─── Asset Validators ──────────────────────────────────────

export const createAssetSchema = z.object({
  name: z.string().min(2, "Asset name must be at least 2 characters"),
  categoryId: z.string().min(1, "Category is required"),
  serialNumber: z.string().nullable().optional(),
  acquisitionDate: z.string().datetime({ offset: true }).or(z.string().date()).pipe(z.coerce.date()).nullable().optional(),
  acquisitionCost: z.number().nonnegative("Acquisition cost must be positive").nullable().optional(),
  condition: z.nativeEnum(AssetCondition),
  location: z.string().min(1, "Location is required"),
  departmentId: z.string().nullable().optional(),
  isBookable: z.boolean().default(false),
  photoUrl: z.string().url("Invalid photo URL").or(z.literal("")).nullable().optional(),
  documentUrl: z.string().url("Invalid document URL").or(z.literal("")).nullable().optional(),
  customFields: z.record(z.string(), z.any()).nullable().optional(),
});

export const updateAssetSchema = z.object({
  name: z.string().min(2, "Asset name must be at least 2 characters").optional(),
  categoryId: z.string().optional(),
  serialNumber: z.string().nullable().optional(),
  acquisitionDate: z.string().datetime({ offset: true }).or(z.string().date()).pipe(z.coerce.date()).nullable().optional(),
  acquisitionCost: z.number().nonnegative("Acquisition cost must be positive").nullable().optional(),
  condition: z.nativeEnum(AssetCondition).optional(),
  location: z.string().optional(),
  departmentId: z.string().nullable().optional(),
  isBookable: z.boolean().optional(),
  status: z.nativeEnum(AssetStatus).optional(),
  photoUrl: z.string().url("Invalid photo URL").or(z.literal("")).nullable().optional(),
  documentUrl: z.string().url("Invalid document URL").or(z.literal("")).nullable().optional(),
  customFields: z.record(z.string(), z.any()).nullable().optional(),
});
