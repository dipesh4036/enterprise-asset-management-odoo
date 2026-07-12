import prisma from "../config/database";

export class ActivityLogService {
  /**
   * Log user actions to database
   */
  async logActivity(
    userId: string,
    action: string,
    entityType: string,
    entityId: string,
    metadata?: object
  ) {
    try {
      return await prisma.activityLog.create({
        data: {
          userId,
          action,
          entityType,
          entityId,
          metadata: metadata ? (metadata as any) : undefined,
        },
      });
    } catch (error) {
      console.error("❌ Failed to create activity log:", error);
      return null;
    }
  }
}

export const activityLogService = new ActivityLogService();
