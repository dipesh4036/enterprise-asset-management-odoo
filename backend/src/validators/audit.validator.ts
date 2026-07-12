import { z } from "zod/v4";
import { AuditEntryStatus } from "@prisma/client";

/**
 * Schema for creating a new audit cycle
 */
export const createAuditCycleSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  departmentId: z.string().or(z.string().length(0)).optional(),
  location: z.string().or(z.string().length(0)).optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  auditorIds: z.array(z.string()).min(1, "Please assign at least one auditor"),
}).refine((data) => data.endDate >= data.startDate, {
  message: "End date must be on or after start date",
  path: ["endDate"],
});

/**
 * Schema for assigning auditors to an audit cycle
 */
export const assignAuditorsSchema = z.object({
  auditorIds: z.array(z.string()).min(1, "Please select at least one auditor"),
});

/**
 * Schema for submitting an audit entry check
 */
export const submitAuditEntrySchema = z.object({
  assetId: z.string().min(1, "Asset ID is required"),
  status: z.nativeEnum(AuditEntryStatus),
  notes: z.string().optional().or(z.string().length(0)),
});
