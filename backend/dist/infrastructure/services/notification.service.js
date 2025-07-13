"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const tsyringe_1 = require("tsyringe");
const custom_error_1 = require("../../utils/errors/custom.error");
const httpResponseCode_utils_1 = require("../../utils/constants/httpResponseCode.utils");
let NotificationService = class NotificationService {
    constructor(notificationRepository) {
        this.notificationRepository = notificationRepository;
    }
    // Create an individual notification
    async createNotification(notificationData) {
        try {
            return await this.notificationRepository.createNotification(notificationData);
        }
        catch (error) {
            console.error('❌ Error creating notification:', error);
            throw new custom_error_1.CustomError('Failed to create notification', httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
    }
    // Create a global notification
    async createGlobalNotification(title, description, type) {
        try {
            const notificationData = {
                _id: null,
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
        }
        catch (error) {
            console.error('❌ Error creating global notification:', error);
            throw new custom_error_1.CustomError('Failed to create global notification', httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
    }
    // Create notifications for all vendors
    async createVendorNotification(title, description, type) {
        try {
            const notificationData = {
                _id: null,
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
        }
        catch (error) {
            console.error('❌ Error creating vendor notifications:', error);
            throw new custom_error_1.CustomError('Failed to create vendor notifications', httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
    }
    // Fetch all notifications for a user (including unread global ones)
    async fetchAllNotifications(userId, page, limit, filter) {
        try {
            return await this.notificationRepository.fetchAllNotifications(userId, page, limit, filter);
        }
        catch (error) {
            console.error('❌ Error fetching notifications:', error);
            throw new custom_error_1.CustomError('Failed to fetch notifications', httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
    }
    // Fetch global notifications
    async fetchAdminNotifications(page, limit, filter) {
        try {
            return await this.notificationRepository.fetchAdminNotifications(page, limit, filter);
        }
        catch (error) {
            console.error('❌ Error fetching admin notifications:', error);
            throw new custom_error_1.CustomError('Failed to fetch admin notifications', httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
    }
    // Mark a single notification as read
    async markNotificationAsRead(notificationId, userId) {
        try {
            return await this.notificationRepository.markNotificationAsRead(notificationId, userId);
        }
        catch (error) {
            console.error('❌ Error marking notification as read:', error);
            throw new custom_error_1.CustomError('Failed to mark notification as read', httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
    }
    // Mark all notifications for a user as read
    async markAllNotificationsAsRead(userId) {
        try {
            return await this.notificationRepository.markAllAsRead(userId);
        }
        catch (error) {
            console.error('❌ Error marking all notifications as read:', error);
            throw new custom_error_1.CustomError('Failed to mark all notifications as read', httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
    }
    async markAllAdminNotificationsAsRead() {
        try {
            return await this.notificationRepository.markAllAdminNotificationsRead();
        }
        catch (error) {
            console.error('❌ Error marking all admin notifications as read:', error);
            throw new custom_error_1.CustomError('Failed to mark all admin notifications as read', httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('NotificationRepository')),
    __metadata("design:paramtypes", [Object])
], NotificationService);
