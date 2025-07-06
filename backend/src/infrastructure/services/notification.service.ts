import { inject, injectable } from 'tsyringe';
import { INotificationRepository } from '../../domain/interfaces/repositories/notification.repository';
import { CustomError } from '../../utils/errors/custom.error';
import { HttpResCode } from '../../utils/constants/httpResponseCode.utils';
import { Notification } from '../../domain/entities/notification.entity';

@injectable()
export class NotificationService {
  constructor(
    @inject('NotificationRepository') private notificationRepository: INotificationRepository,
  ) {}

  // Create an individual notification
  async createNotification(notificationData: Partial<Notification>): Promise<Notification> {
    try {
      return await this.notificationRepository.createNotification(notificationData as Notification);
    } catch (error) {
      console.error('❌ Error creating notification:', error);
      throw new CustomError('Failed to create notification', HttpResCode.INTERNAL_SERVER_ERROR);
    }
  }

  // Create a global notification
  async createGlobalNotification(title: string, description: string, type: string): Promise<void> {
    try {
      const notificationData: Notification = {
        _id: null as any,
        userId: null,
        title,
        description,
        type,
        isGlobal: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        isRead: false,
        readedUsers: [],
      };

      await this.notificationRepository.createGlobalNotification(notificationData);
    } catch (error) {
      console.error('❌ Error creating global notification:', error);
      throw new CustomError(
        'Failed to create global notification',
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Create notifications for all vendors
  async createVendorNotification(title: string, description: string, type: string): Promise<void> {
    try {
      const notificationData: Notification = {
        _id: null as any,
        userId: null,
        title,
        description,
        type,
        isGlobal: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        isRead: false,
        readedUsers: [],
      };
      await this.notificationRepository.createVendorNotification(notificationData);
    } catch (error) {
      console.error('❌ Error creating vendor notifications:', error);
      throw new CustomError(
        'Failed to create vendor notifications',
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Fetch all notifications for a user (including unread global ones)
  async fetchAllNotifications(
    userId: string,
    page: number,
    limit: number,
    filter: string,
  ): Promise<{
    notifications: Notification[];
    total: number;
    unreadCount: number;
    readCount: number;
  }> {
    try {
      return await this.notificationRepository.fetchAllNotifications(userId, page, limit, filter);
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      throw new CustomError('Failed to fetch notifications', HttpResCode.INTERNAL_SERVER_ERROR);
    }
  }

  // Fetch global notifications
  async fetchAdminNotifications(
    page: number,
    limit: number,
    filter: string,
  ): Promise<{
    notifications: Notification[];
    total: number;
    unreadCount: number;
    readCount: number;
  }> {
    try {
      return await this.notificationRepository.fetchAdminNotifications(page, limit, filter);
    } catch (error) {
      console.error('❌ Error fetching admin notifications:', error);
      throw new CustomError(
        'Failed to fetch admin notifications',
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Mark a single notification as read
  async markNotificationAsRead(notificationId: string, userId: string): Promise<boolean> {
    try {
      return await this.notificationRepository.markNotificationAsRead(notificationId, userId);
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      throw new CustomError(
        'Failed to mark notification as read',
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Mark all notifications for a user as read
  async markAllNotificationsAsRead(userId: string): Promise<boolean> {
    try {
      return await this.notificationRepository.markAllAsRead(userId);
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
      throw new CustomError(
        'Failed to mark all notifications as read',
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async markAllAdminNotificationsAsRead(): Promise<boolean> {
    try {
      return await this.notificationRepository.markAllAdminNotificationsRead();
    } catch (error) {
      console.error('❌ Error marking all admin notifications as read:', error);
      throw new CustomError(
        'Failed to mark all admin notifications as read',
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
