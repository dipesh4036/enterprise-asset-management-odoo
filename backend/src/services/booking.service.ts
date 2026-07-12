import prisma from "../config/database";
import { activityLogService } from "./activityLog.service";
import { notificationService } from "./notification.service";
import { BookingStatus, Role } from "@prisma/client";

interface CreateBookingData {
  assetId: string;
  startTime: Date;
  endTime: Date;
  notes?: string | null;
}

export class BookingService {
  /**
   * Retrieves bookings for an asset, optionally filtered by a specific date
   */
  async getBookings(assetId: string, dateStr?: string) {
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      throw new Error("Asset not found");
    }

    if (!asset.isBookable) {
      throw new Error("Asset is not configured as a bookable shared resource");
    }

    const where: any = {
      assetId,
      status: { not: BookingStatus.CANCELLED },
    };

    if (dateStr) {
      const date = new Date(dateStr);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      where.AND = [
        { startTime: { lt: endOfDay } },
        { endTime: { gt: startOfDay } },
      ];
    }

    return prisma.resourceBooking.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { startTime: "asc" },
    });
  }

  /**
   * Creates a new booking if no overlapping bookings exist
   */
  async createBooking(userId: string, data: CreateBookingData) {
    const asset = await prisma.asset.findUnique({
      where: { id: data.assetId },
    });

    if (!asset) {
      throw new Error("Asset not found");
    }

    if (!asset.isBookable) {
      throw new Error("Asset is not bookable as a shared resource");
    }

    // Overlap validation: startTime < existing.endTime AND endTime > existing.startTime
    const overlapping = await prisma.resourceBooking.findFirst({
      where: {
        assetId: data.assetId,
        status: { not: BookingStatus.CANCELLED },
        AND: [
          { startTime: { lt: data.endTime } },
          { endTime: { gt: data.startTime } },
        ],
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    if (overlapping) {
      const startStr = overlapping.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const endStr = overlapping.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      throw new Error(
        `Time slot overlaps with an existing booking (${overlapping.user.name}: ${startStr} - ${endStr})`
      );
    }

    const booking = await prisma.resourceBooking.create({
      data: {
        assetId: data.assetId,
        userId,
        startTime: data.startTime,
        endTime: data.endTime,
        notes: data.notes || null,
        status: BookingStatus.UPCOMING,
      },
    });

    await activityLogService.logActivity(
      userId,
      "BOOKING_CREATED",
      "BOOKING",
      booking.id,
      { assetTag: asset.assetTag, startTime: data.startTime, endTime: data.endTime }
    );

    await notificationService.createNotification(
      userId,
      "BOOKING_CONFIRMED",
      `Your booking for ${asset.name} (${asset.assetTag}) has been confirmed.`,
      booking.id
    );

    return booking;
  }

  /**
   * Cancels an existing booking
   */
  async cancelBooking(userId: string, bookingId: string, userRole: Role) {
    const booking = await prisma.resourceBooking.findUnique({
      where: { id: bookingId },
      include: { asset: true },
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    // Verify ownership or management privileges
    if (booking.userId !== userId && userRole !== Role.ADMIN && userRole !== Role.ASSET_MANAGER) {
      throw new Error("Access denied: You cannot cancel this booking");
    }

    const updated = await prisma.resourceBooking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CANCELLED },
    });

    await activityLogService.logActivity(
      userId,
      "BOOKING_CANCELLED",
      "BOOKING",
      bookingId,
      { assetTag: booking.asset.assetTag }
    );

    await notificationService.createNotification(
      booking.userId,
      "BOOKING_CANCELLED",
      `Your booking for ${booking.asset.name} (${booking.asset.assetTag}) has been cancelled.`,
      bookingId
    );

    return updated;
  }

  /**
   * Reschedules an existing booking, checking for overlaps
   */
  async rescheduleBooking(
    userId: string,
    bookingId: string,
    data: { startTime: Date; endTime: Date },
    userRole: Role
  ) {
    const booking = await prisma.resourceBooking.findUnique({
      where: { id: bookingId },
      include: { asset: true },
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    // Verify ownership or management privileges
    if (booking.userId !== userId && userRole !== Role.ADMIN && userRole !== Role.ASSET_MANAGER) {
      throw new Error("Access denied: You cannot reschedule this booking");
    }

    // Overlap validation: check for other bookings
    const overlapping = await prisma.resourceBooking.findFirst({
      where: {
        assetId: booking.assetId,
        id: { not: bookingId },
        status: { not: BookingStatus.CANCELLED },
        AND: [
          { startTime: { lt: data.endTime } },
          { endTime: { gt: data.startTime } },
        ],
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    if (overlapping) {
      const startStr = overlapping.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const endStr = overlapping.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      throw new Error(
        `New time slot overlaps with an existing booking (${overlapping.user.name}: ${startStr} - ${endStr})`
      );
    }

    const updated = await prisma.resourceBooking.update({
      where: { id: bookingId },
      data: {
        startTime: data.startTime,
        endTime: data.endTime,
        status: BookingStatus.UPCOMING,
      },
    });

    await activityLogService.logActivity(
      userId,
      "BOOKING_RESCHEDULED",
      "BOOKING",
      bookingId,
      { assetTag: booking.asset.assetTag, startTime: data.startTime, endTime: data.endTime }
    );

    return updated;
  }
}

export const bookingService = new BookingService();
