import { z } from "zod/v4";

// ─── Allocation Validators ──────────────────────────────────

export const createAllocationSchema = z.object({
  assetId: z.string().min(1, "Asset ID is required"),
  employeeId: z.string().min(1, "Employee ID is required"),
  expectedReturnAt: z.string().datetime({ offset: true }).or(z.string().date()).pipe(z.coerce.date()).nullable().optional(),
});

export const returnAllocationSchema = z.object({
  conditionNotes: z.string().min(3, "Condition notes must be at least 3 characters"),
});

// ─── Transfer Validators ────────────────────────────────────

export const createTransferSchema = z.object({
  assetId: z.string().min(1, "Asset ID is required"),
  reason: z.string().nullable().optional(),
});
