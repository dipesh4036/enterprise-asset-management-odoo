import prisma from "../config/database";
import { ACTIVITY_ACTIONS, ENTITY_TYPES, PAGINATION } from "../config/constants";

/**
 * Creates an activity log entry in the database
 */
export async function logActivity(
  userId: string,
  action: keyof typeof ACTIVITY_ACTIONS,
  entityType: keyof typeof ENTITY_TYPES,
  entityId: string,
  metadata?: any
) {
  return prisma.activityLog.create({
    data: {
      userId,
      action,
      entityType,
      entityId,
      metadata: metadata || undefined,
    },
  });
}

interface GetActivityLogsOptions {
  userId?: string;
  entityType?: string;
  entityId?: string;
  page?: number;
  limit?: number;
}

/**
 * Retrieves paginated activity logs with optional filtering
 */
export async function getActivityLogs(options: GetActivityLogsOptions = {}) {
  const page = options.page || PAGINATION.DEFAULT_PAGE;
  const limit = Math.min(options.limit || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
  const skip = (page - 1) * limit;

  const where: any = {};
  if (options.userId) {
    where.userId = options.userId;
  }
  if (options.entityType) {
    where.entityType = options.entityType;
  }
  if (options.entityId) {
    where.entityId = options.entityId;
  }

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    }),
    prisma.activityLog.count({ where }),
  ]);

  return { logs, total };
}

const activityLogService = {
  logActivity,
  getActivityLogs,
};

export default activityLogService;

