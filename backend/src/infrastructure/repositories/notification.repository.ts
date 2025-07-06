import mongoose from 'mongoose';
import NotificationModel from '../database/notification.model';
import { INotificationRepository } from '../../domain/interfaces/repositories/notification.repository';
import { Notification } from '../../domain/entities/notification.entity';

export class NotificationRepository implements INotificationRepository {
  async createNotification(notification: Notification): Promise<Notification> {
    try {
      const newNotification = new NotificationModel(notification);
      const saved = await newNotification.save();
      return this.mapToEntity(saved);
    } catch (error) {
      console.error('❌ Error creating notification:', error);
      throw new Error('Failed to create notification');
    }
  }

  async createGlobalNotification(notification: Notification): Promise<Notification> {
    try {
      notification.isGlobal = true;
      notification.userId = null;
      const newNotification = new NotificationModel(notification);
      const saved = await newNotification.save();
      return this.mapToEntity(saved);
    } catch (error) {
      console.error('❌ Error creating global notification:', error);
      throw new Error('Failed to create global notification');
    }
  }

  async createVendorNotification(notification: Notification): Promise<Notification[]> {
    try {
      const VendorModel = mongoose.model('User');
      const vendors = await VendorModel.find({ role: 'Vendor' }, '_id');

      const notifications = vendors.map((vendor) => ({
        ...notification,
        userId: vendor._id,
        isGlobal: false,
      }));

      const insertedNotifications = await NotificationModel.insertMany(notifications);
      return insertedNotifications.map(this.mapToEntity); // Map all inserted notifications to entity format
    } catch (error) {
      console.error('❌ Error creating vendor notifications:', error);
      throw new Error('Failed to create vendor notifications');
    }
  }

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
      // Base query for notifications
      const baseQuery: Record<string, any> = {
        userId,
      };

      // Apply filter
      let query: Record<string, any> = { ...baseQuery };
      if (filter === 'read') {
        query.isRead = true;
      } else if (filter === 'unread') {
        query.isRead = false;
      }

      // Fetch paginated notifications
      const notifications = await NotificationModel.find(query)
        .sort({ isRead: 1, createdAt: -1 }) // Unread first, then newest
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      // Fetch counts
      const total = await NotificationModel.countDocuments(baseQuery);
      const unreadCount = await NotificationModel.countDocuments({ ...baseQuery, isRead: false });
      const readCount = await NotificationModel.countDocuments({ ...baseQuery, isRead: true });

      return {
        notifications: notifications.map(this.mapToEntity),
        total,
        unreadCount,
        readCount,
      };
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      throw new Error('Failed to fetch notifications');
    }
  }

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
      // Base query for global notifications
      const baseQuery: Record<string, any> = {
        isGlobal: true,
      };

      // Apply read/unread filter
      let query: Record<string, any> = { ...baseQuery };
      if (filter === 'read') {
        query.isRead = true;
      } else if (filter === 'unread') {
        query.isRead = false;
      }

      // Fetch paginated and sorted global notifications
      const notifications = await NotificationModel.find(query)
        .sort({ isRead: 1, createdAt: -1 }) // Unread first, then newest
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      // Count totals
      const total = await NotificationModel.countDocuments(baseQuery);
      const unreadCount = await NotificationModel.countDocuments({ ...baseQuery, isRead: false });
      const readCount = await NotificationModel.countDocuments({ ...baseQuery, isRead: true });

      return {
        notifications: notifications.map(this.mapToEntity),
        total,
        unreadCount,
        readCount,
      };
    } catch (error) {
      console.error('❌ Error fetching admin notifications:', error);
      throw new Error('Failed to fetch admin notifications');
    }
  }

  async fetchVendorNotifications(vendorId: string): Promise<Notification[]> {
    try {
      const notifications = await NotificationModel.find({ userId: vendorId }).lean();
      return notifications.map(this.mapToEntity);
    } catch (error) {
      console.error('❌ Error fetching vendor notifications:', error);
      throw new Error('Failed to fetch vendor notifications');
    }
  }

  async markNotificationAsRead(notificationId: string, userId: string): Promise<boolean> {
    try {
      await NotificationModel.updateOne({ _id: notificationId }, { isRead: true });
      return true;
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      throw new Error('Failed to mark notification as read');
    }
  }

  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      await NotificationModel.updateMany({ userId }, { isRead: true });
      return true;
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
      throw new Error('Failed to mark all notifications as read');
    }
  }

  async markAllAdminNotificationsRead(): Promise<boolean> {
    try {
      await NotificationModel.updateMany({ isGlobal: true, isRead: false }, { isRead: true });
      return true;
    } catch (error) {
      console.error('❌ Error marking admin notifications as read:', error);
      throw new Error('Failed to mark admin notifications as read');
    }
  }

  private mapToEntity(doc: any): Notification {
    return new Notification(
      doc._id?.toString(),
      doc.userId?.toString() || null,
      doc.title,
      doc.type,
      doc.description,
      doc.bookingId?.toString() || null,
      doc.createdAt,
      doc.updatedAt,
      doc.isRead,
      doc.isGlobal,
      doc.readedUsers?.map((user: mongoose.Types.ObjectId) => user.toString()) || [], // Convert ObjectId array to string array
    );
  }
}
