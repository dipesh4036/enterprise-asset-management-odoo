import prisma from "../config/database";
import { NOTIFICATION_TYPES } from "../config/constants";

/**
 * Creates a new notification for a user
 */
export async function createNotification(
  userId: string,
  type: keyof typeof NOTIFICATION_TYPES,
  message: string,
  entityId?: string
) {
  return prisma.notification.create({
    data: {
      userId,
      type,
      message,
      entityId,
    },
  });
}

/**
 * Retrieves the 50 most recent notifications for a user
 */
export async function getUserNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

/**
 * Marks a specific notification as read, checking owner validation
 */
export async function markAsRead(notificationId: string, userId: string) {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification) {
    throw new Error("Notification not found");
  }

  if (notification.userId !== userId) {
    throw new Error("Access denied: You do not own this notification");
  }

  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
}

/**
 * Marks all unread notifications of a user as read
 */
export async function markAllAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });
}

export const notificationService = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
};

export default notificationService;
