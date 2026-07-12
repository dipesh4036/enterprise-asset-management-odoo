import { z } from "zod/v4";

// ─── Booking Validators ──────────────────────────────────────

export const createBookingSchema = z.object({
  assetId: z.string().min(1, "Asset ID is required"),
  startTime: z.string().datetime({ offset: true }).or(z.string().date()).pipe(z.coerce.date()),
  endTime: z.string().datetime({ offset: true }).or(z.string().date()).pipe(z.coerce.date()),
  notes: z.string().nullable().optional(),
}).refine((data) => data.endTime > data.startTime, {
  message: "End time must be strictly after start time",
  path: ["endTime"],
});

export const rescheduleBookingSchema = z.object({
  startTime: z.string().datetime({ offset: true }).or(z.string().date()).pipe(z.coerce.date()),
  endTime: z.string().datetime({ offset: true }).or(z.string().date()).pipe(z.coerce.date()),
}).refine((data) => data.endTime > data.startTime, {
  message: "End time must be strictly after start time",
  path: ["endTime"],
});
