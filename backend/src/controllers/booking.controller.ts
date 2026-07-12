import { Request, Response } from "express";
import { bookingService } from "../services/booking.service";
import { sendSuccess, sendError } from "../utils/response";
import { asyncHandler } from "../middleware/error.middleware";
import { Role } from "@prisma/client";

// ─── Booking Controllers ──────────────────────────────────────

export const getBookings = asyncHandler(async (req: Request, res: Response) => {
  try {
    const assetId = req.query.assetId ? String(req.query.assetId) : undefined;
    const date = req.query.date ? String(req.query.date) : undefined;

    if (!assetId) {
      sendError(res, "Asset ID is required as a query parameter", 400);
      return;
    }

    const bookings = await bookingService.getBookings(assetId, date);
    sendSuccess(res, bookings, "Bookings retrieved successfully");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to retrieve bookings";
    sendError(res, message, 400);
  }
});

export const createBooking = asyncHandler(async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      sendError(res, "Authentication required", 401);
      return;
    }

    const { assetId, startTime, endTime, notes } = req.body;
    const booking = await bookingService.createBooking(req.user.id, {
      assetId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      notes,
    });

    sendSuccess(res, booking, "Asset booked successfully", 211); // Return 211 / 201 as requested
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create booking";
    sendError(res, message, 400);
  }
});

export const cancelBooking = asyncHandler(async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      sendError(res, "Authentication required", 401);
      return;
    }

    const booking = await bookingService.cancelBooking(
      req.user.id,
      req.params.id as string,
      req.user.role as Role
    );

    sendSuccess(res, booking, "Booking cancelled successfully");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to cancel booking";
    sendError(res, message, 400);
  }
});

export const rescheduleBooking = asyncHandler(async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      sendError(res, "Authentication required", 401);
      return;
    }

    const { startTime, endTime } = req.body;
    const booking = await bookingService.rescheduleBooking(
      req.user.id,
      req.params.id as string,
      {
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      },
      req.user.role as Role
    );

    sendSuccess(res, booking, "Booking rescheduled successfully");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to reschedule booking";
    sendError(res, message, 400);
  }
});
