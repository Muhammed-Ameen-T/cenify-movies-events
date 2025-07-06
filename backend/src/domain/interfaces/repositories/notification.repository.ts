import { Notification } from '../../entities/notification.entity';

export interface INotificationRepository {
  createNotification(notification: Notification): Promise<Notification>;
  createGlobalNotification(notification: Notification): Promise<Notification>;
  createVendorNotification(notification: Notification): Promise<Notification[]>;
  fetchAllNotifications(
    userId: string,
    page: number,
    limit: number,
    filter: string,
  ): Promise<{
    notifications: Notification[];
    total: number;
    unreadCount: number;
    readCount: number;
  }>;
  fetchAdminNotifications(
    page: number,
    limit: number,
    filter: string,
  ): Promise<{
    notifications: Notification[];
    total: number;
    unreadCount: number;
    readCount: number;
  }>;
  fetchVendorNotifications(vendorId: string): Promise<Notification[]>;
  markNotificationAsRead(notificationId: string, userId: string): Promise<boolean>;
  markAllAsRead(userId: string): Promise<boolean>;
  markAllAdminNotificationsRead(): Promise<boolean>;
}
