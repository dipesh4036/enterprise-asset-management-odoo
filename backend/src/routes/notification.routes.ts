import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getActivityLogs,
} from "../controllers/notification.controller";

const notificationRouter = Router();

// Notification routes (Protected: All authenticated users)
notificationRouter.use(authMiddleware);
notificationRouter.get("/", getNotifications);
notificationRouter.patch("/:id/read", markNotificationAsRead);
notificationRouter.patch("/read-all", markAllNotificationsAsRead);

const activityLogRouter = Router();

// Activity log routes (Protected: Authenticated Admins and Asset Managers only)
activityLogRouter.use(authMiddleware);
activityLogRouter.get("/", requireRole("ADMIN", "ASSET_MANAGER"), getActivityLogs);

export { activityLogRouter };
export default notificationRouter;
