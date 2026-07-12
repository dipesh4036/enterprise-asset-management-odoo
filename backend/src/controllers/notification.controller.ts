import { Request, Response, NextFunction } from "express";
import * as notificationService from "../services/notification.service";
import * as activityLogService from "../services/activityLog.service";
import { sendSuccess, sendError, sendPaginated } from "../utils/response";

/**
 * Get all notifications for the logged-in user
 */
export async function getNotifications(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      sendError(res, "Authentication required", 401);
      return;
    }

    const notifications = await notificationService.getUserNotifications(req.user.id);
    sendSuccess(res, notifications, "Notifications retrieved successfully");
  } catch (error) {
    next(error);
  }
}

/**
 * Mark a specific notification as read
 */
export async function markNotificationAsRead(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      sendError(res, "Authentication required", 401);
      return;
    }

    const id = req.params.id as string;
    if (!id) {
      sendError(res, "Notification ID is required", 400);
      return;
    }

    const updatedNotification = await notificationService.markAsRead(id, req.user.id);
    sendSuccess(res, updatedNotification, "Notification marked as read");
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        sendError(res, error.message, 404);
        return;
      }
      if (error.message.includes("Access denied")) {
        sendError(res, error.message, 403);
        return;
      }
    }
    next(error);
  }
}

/**
 * Mark all notifications as read for the logged-in user
 */
export async function markAllNotificationsAsRead(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      sendError(res, "Authentication required", 401);
      return;
    }

    const result = await notificationService.markAllAsRead(req.user.id);
    sendSuccess(res, { count: result.count }, "All notifications marked as read");
  } catch (error) {
    next(error);
  }
}

/**
 * Get activity logs with pagination and optional filtering
 */
export async function getActivityLogs(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.query.userId as string | undefined;
    const entityType = req.query.entityType as string | undefined;
    const entityId = req.query.entityId as string | undefined;
    
    const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;

    const { logs, total } = await activityLogService.getActivityLogs({
      userId,
      entityType,
      entityId,
      page,
      limit,
    });

    const parsedPage = page || 1;
    const parsedLimit = limit || 10;

    sendPaginated(res, logs, total, parsedPage, parsedLimit, "Activity logs retrieved successfully");
  } catch (error) {
    next(error);
  }
}
