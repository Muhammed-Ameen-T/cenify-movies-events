"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRepository = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const notification_model_1 = __importDefault(require("../database/notification.model"));
const notification_entity_1 = require("../../domain/entities/notification.entity");
class NotificationRepository {
    async createNotification(notification) {
        try {
            const newNotification = new notification_model_1.default(notification);
            const saved = await newNotification.save();
            return this.mapToEntity(saved);
        }
        catch (error) {
            console.error('❌ Error creating notification:', error);
            throw new Error('Failed to create notification');
        }
    }
    async createGlobalNotification(notification) {
        try {
            notification.isGlobal = true;
            notification.userId = null;
            const newNotification = new notification_model_1.default(notification);
            const saved = await newNotification.save();
            return this.mapToEntity(saved);
        }
        catch (error) {
            console.error('❌ Error creating global notification:', error);
            throw new Error('Failed to create global notification');
        }
    }
    async createVendorNotification(notification) {
        try {
            const VendorModel = mongoose_1.default.model('User');
            const vendors = await VendorModel.find({ role: 'Vendor' }, '_id');
            const notifications = vendors.map((vendor) => ({
                ...notification,
                userId: vendor._id,
                isGlobal: false,
            }));
            const insertedNotifications = await notification_model_1.default.insertMany(notifications);
            return insertedNotifications.map(this.mapToEntity); // Map all inserted notifications to entity format
        }
        catch (error) {
            console.error('❌ Error creating vendor notifications:', error);
            throw new Error('Failed to create vendor notifications');
        }
    }
    async fetchAllNotifications(userId, page, limit, filter) {
        try {
            // Base query for notifications
            const baseQuery = {
                userId,
            };
            // Apply filter
            let query = { ...baseQuery };
            if (filter === 'read') {
                query.isRead = true;
            }
            else if (filter === 'unread') {
                query.isRead = false;
            }
            // Fetch paginated notifications
            const notifications = await notification_model_1.default.find(query)
                .sort({ isRead: 1, createdAt: -1 }) // Unread first, then newest
                .skip((page - 1) * limit)
                .limit(limit)
                .lean();
            // Fetch counts
            const total = await notification_model_1.default.countDocuments(baseQuery);
            const unreadCount = await notification_model_1.default.countDocuments({ ...baseQuery, isRead: false });
            const readCount = await notification_model_1.default.countDocuments({ ...baseQuery, isRead: true });
            return {
                notifications: notifications.map(this.mapToEntity),
                total,
                unreadCount,
                readCount,
            };
        }
        catch (error) {
            console.error('❌ Error fetching notifications:', error);
            throw new Error('Failed to fetch notifications');
        }
    }
    async fetchAdminNotifications(page, limit, filter) {
        try {
            // Base query for global notifications
            const baseQuery = {
                isGlobal: true,
            };
            // Apply read/unread filter
            let query = { ...baseQuery };
            if (filter === 'read') {
                query.isRead = true;
            }
            else if (filter === 'unread') {
                query.isRead = false;
            }
            // Fetch paginated and sorted global notifications
            const notifications = await notification_model_1.default.find(query)
                .sort({ isRead: 1, createdAt: -1 }) // Unread first, then newest
                .skip((page - 1) * limit)
                .limit(limit)
                .lean();
            // Count totals
            const total = await notification_model_1.default.countDocuments(baseQuery);
            const unreadCount = await notification_model_1.default.countDocuments({ ...baseQuery, isRead: false });
            const readCount = await notification_model_1.default.countDocuments({ ...baseQuery, isRead: true });
            return {
                notifications: notifications.map(this.mapToEntity),
                total,
                unreadCount,
                readCount,
            };
        }
        catch (error) {
            console.error('❌ Error fetching admin notifications:', error);
            throw new Error('Failed to fetch admin notifications');
        }
    }
    async fetchVendorNotifications(vendorId) {
        try {
            const notifications = await notification_model_1.default.find({ userId: vendorId }).lean();
            return notifications.map(this.mapToEntity);
        }
        catch (error) {
            console.error('❌ Error fetching vendor notifications:', error);
            throw new Error('Failed to fetch vendor notifications');
        }
    }
    async markNotificationAsRead(notificationId, userId) {
        try {
            await notification_model_1.default.updateOne({ _id: notificationId }, { isRead: true });
            return true;
        }
        catch (error) {
            console.error('❌ Error marking notification as read:', error);
            throw new Error('Failed to mark notification as read');
        }
    }
    async markAllAsRead(userId) {
        try {
            await notification_model_1.default.updateMany({ userId }, { isRead: true });
            return true;
        }
        catch (error) {
            console.error('❌ Error marking all notifications as read:', error);
            throw new Error('Failed to mark all notifications as read');
        }
    }
    async markAllAdminNotificationsRead() {
        try {
            await notification_model_1.default.updateMany({ isGlobal: true, isRead: false }, { isRead: true });
            return true;
        }
        catch (error) {
            console.error('❌ Error marking admin notifications as read:', error);
            throw new Error('Failed to mark admin notifications as read');
        }
    }
    mapToEntity(doc) {
        return new notification_entity_1.Notification(doc._id?.toString(), doc.userId?.toString() || null, doc.title, doc.type, doc.description, doc.bookingId?.toString() || null, doc.createdAt, doc.updatedAt, doc.isRead, doc.isGlobal, doc.readedUsers?.map((user) => user.toString()) || []);
    }
}
exports.NotificationRepository = NotificationRepository;
