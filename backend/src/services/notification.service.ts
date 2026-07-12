import prisma from "../config/database";

export class NotificationService {
  /**
   * Create notification for a user
   */
  async createNotification(
    userId: string,
    type: string,
    message: string,
    entityId?: string
  ) {
    try {
      return await prisma.notification.create({
        data: {
          userId,
          type,
          message,
          entityId,
          isRead: false,
        },
      });
    } catch (error) {
      console.error("❌ Failed to create notification:", error);
      return null;
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;
