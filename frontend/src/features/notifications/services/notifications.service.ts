import { api } from "@/lib/axios";

export interface NotificationItem {
  id: string;
  userId: string;
  type: string; // e.g. ASSET_ASSIGNED, AUDIT_DISCREPANCY, MAINTENANCE_ALERT
  message: string;
  isRead: boolean;
  entityId: string | null;
  createdAt: string;
}

export interface NotificationsResponse {
  success: boolean;
  message: string;
  data: NotificationItem[];
}

export interface SingleNotificationResponse {
  success: boolean;
  message: string;
  data: NotificationItem;
}

export const notificationsService = {
  /**
   * Fetch all user notifications
   */
  async getNotifications(): Promise<NotificationsResponse> {
    const res = await api.get<NotificationsResponse>("/notifications");
    return res.data;
  },

  /**
   * Mark a specific notification as read
   */
  async markAsRead(id: string): Promise<SingleNotificationResponse> {
    const res = await api.patch<SingleNotificationResponse>(`/notifications/${id}/read`);
    return res.data;
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<NotificationsResponse> {
    const res = await api.patch<NotificationsResponse>("/notifications/read-all");
    return res.data;
  },
};
export default notificationsService;
