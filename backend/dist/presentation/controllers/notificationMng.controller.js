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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationMngController = void 0;
// src/presentation/controllers/notificationMng/notificationMng.controller.ts
require("reflect-metadata");
const tsyringe_1 = require("tsyringe");
const sendResponse_utils_1 = require("../../utils/response/sendResponse.utils");
const httpResponseCode_utils_1 = require("../../utils/constants/httpResponseCode.utils");
const commonErrorMsg_constants_1 = __importDefault(require("../../utils/constants/commonErrorMsg.constants"));
const custom_error_1 = require("../../utils/errors/custom.error");
const notification_service_1 = require("../../infrastructure/services/notification.service");
let NotificationMngController = class NotificationMngController {
    constructor(notificationService) {
        this.notificationService = notificationService;
    }
    /**
     * @route POST /api/notifications/global
     * @desc Create a new global notification
     * @access Admin
     * @body {string} title - The title of the global notification
     * @body {string} description - The description/content of the global notification
     * @body {string} type - The type of the notification (e.g., 'announcement', 'update')
     */
    async createGlobalNotification(req, res, next) {
        try {
            const { title, description, type } = req.body;
            if (!title || !description || !type) {
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.MISSING_REQUIRED_FIELDS, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            await this.notificationService.createGlobalNotification(title, description, type);
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.CREATED, httpResponseCode_utils_1.HttpResMsg.SUCCESS, {
                message: 'Global notification created successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @route POST /api/notifications/user
     * @desc Create a new user-specific notification
     * @access Authenticated User
     * @body {string} title - The title of the notification
     * @body {string} description - The description/content of the notification
     * @body {string} type - The type of the notification (e.g., 'booking_update', 'promo')
     */
    async createUserNotification(req, res, next) {
        try {
            const userId = req.decoded?.userId;
            if (!userId) {
                throw new custom_error_1.CustomError(httpResponseCode_utils_1.HttpResMsg.UNAUTHORIZED, httpResponseCode_utils_1.HttpResCode.UNAUTHORIZED);
            }
            const { title, description, type } = req.body;
            if (!title || !description || !type) {
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.MISSING_REQUIRED_FIELDS, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            const notificationData = {
                userId: userId, // Assign the specific user ID
                title,
                description,
                type,
                isGlobal: false,
            };
            const newNotification = await this.notificationService.createNotification(notificationData);
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.CREATED, httpResponseCode_utils_1.HttpResMsg.SUCCESS, newNotification);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @route PATCH /api/notifications/:id/read
     * @desc Mark a specific notification as read for the authenticated user
     * @access Authenticated User
     * @param {string} id - The ID of the notification to mark as read
     */
    async readOneNotification(req, res, next) {
        try {
            const { id: notificationId } = req.params;
            const userId = req.decoded?.userId;
            if (!userId) {
                throw new custom_error_1.CustomError(httpResponseCode_utils_1.HttpResMsg.UNAUTHORIZED, httpResponseCode_utils_1.HttpResCode.UNAUTHORIZED);
            }
            if (!notificationId) {
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.MISSING_REQUIRED_FIELDS, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            const success = await this.notificationService.markNotificationAsRead(notificationId, userId);
            if (success) {
                (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, httpResponseCode_utils_1.HttpResMsg.SUCCESS, {
                    message: 'Notification marked as read',
                });
            }
            else {
                (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.NOT_FOUND, commonErrorMsg_constants_1.default.DATABASE.RECORD_NOT_FOUND);
            }
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @route PATCH /api/notifications/read-all
     * @desc Mark all notifications as read for the authenticated user
     * @access Authenticated User
     */
    async readAllNotification(req, res, next) {
        try {
            const userId = req.decoded?.userId;
            if (!userId) {
                throw new custom_error_1.CustomError(httpResponseCode_utils_1.HttpResMsg.UNAUTHORIZED, httpResponseCode_utils_1.HttpResCode.UNAUTHORIZED);
            }
            const success = await this.notificationService.markAllNotificationsAsRead(userId);
            if (success) {
                (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, httpResponseCode_utils_1.HttpResMsg.SUCCESS, {
                    message: 'All notifications marked as read',
                });
            }
            else {
                (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR, 'Failed to mark all notifications as read');
            }
        }
        catch (error) {
            next(error);
        }
    }
    async readAllAdminNotification(req, res, next) {
        try {
            const adminId = req.decoded?.userId;
            if (!adminId) {
                throw new custom_error_1.CustomError(httpResponseCode_utils_1.HttpResMsg.UNAUTHORIZED, httpResponseCode_utils_1.HttpResCode.UNAUTHORIZED);
            }
            const success = await this.notificationService.markAllAdminNotificationsAsRead();
            if (success) {
                (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, httpResponseCode_utils_1.HttpResMsg.SUCCESS, {
                    message: 'All Admin notifications marked as read',
                });
            }
            else {
                (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR, 'Failed to mark all notifications as read');
            }
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @route GET /api/notifications/user
     * @desc Fetch all notifications for the authenticated user (including relevant global ones)
     * @access Authenticated User
     */
    async fetchAllUserNotification(req, res, next) {
        try {
            const userId = req.decoded?.userId;
            if (!userId) {
                throw new custom_error_1.CustomError(httpResponseCode_utils_1.HttpResMsg.UNAUTHORIZED, httpResponseCode_utils_1.HttpResCode.UNAUTHORIZED);
            }
            const page = parseInt(req.query.page, 10) || 1;
            const limit = parseInt(req.query.limit, 10) || 5;
            const filter = req.query.filter || 'all';
            if (!['all', 'read', 'unread'].includes(filter)) {
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.MISSING_REQUIRED_FIELDS, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            const { notifications, total, unreadCount, readCount } = await this.notificationService.fetchAllNotifications(userId, page, limit, filter);
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, httpResponseCode_utils_1.HttpResMsg.SUCCESS, {
                notifications,
                total,
                unreadCount,
                readCount,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @route POST /api/notifications/vendor
     * @desc Create a new vendor-specific notification
     * @access Admin/Vendor Management (needs appropriate authorization check)
     * @body {string} vendorId - The ID of the vendor to notify
     * @body {string} title - The title of the notification
     * @body {string} description - The description/content of the notification
     * @body {string} type - The type of the notification (e.g., 'payout_alert', 'order_update')
     */
    async createVendorNotification(req, res, next) {
        try {
            // Assuming `vendorId` might come from `req.body` or `req.decoded` based on the auth context.
            // For this example, I'll assume it's passed in the body if an admin is creating it for a specific vendor.
            // If it's the vendor themselves, then req.decoded?.userId would be used and mapped to a vendorId.
            const { title, description, type, vendorId } = req.body;
            if (!title || !description || !type || !vendorId) {
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.MISSING_REQUIRED_FIELDS, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            // The service method expects a Notification entity, which the createVendorNotification in service
            // then constructs based on passed parameters. For this, we'll mimic what the service expects.
            await this.notificationService.createVendorNotification(title, description, type);
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.CREATED, httpResponseCode_utils_1.HttpResMsg.SUCCESS, {
                message: 'Vendor notification created successfully',
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @route GET /api/notifications/vendor/:vendorId (or /api/notifications/vendors/me)
     * @desc Fetch all notifications specific to a vendor
     * @access Vendor (needs appropriate authorization check)
     * @param {string} vendorId - The ID of the vendor
     */
    async fetchAllAdminNotification(req, res, next) {
        try {
            const adminId = req.decoded?.userId;
            if (!adminId) {
                throw new custom_error_1.CustomError(httpResponseCode_utils_1.HttpResMsg.UNAUTHORIZED, httpResponseCode_utils_1.HttpResCode.UNAUTHORIZED);
            }
            const page = parseInt(req.query.page, 10) || 1;
            const limit = parseInt(req.query.limit, 10) || 5;
            const filter = req.query.filter || 'all';
            if (!['all', 'read', 'unread'].includes(filter)) {
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.MISSING_REQUIRED_FIELDS, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            const { notifications, total, unreadCount, readCount } = await this.notificationService.fetchAdminNotifications(page, limit, filter);
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, httpResponseCode_utils_1.HttpResMsg.SUCCESS, {
                notifications,
                total,
                unreadCount,
                readCount,
            });
        }
        catch (error) {
            next(error);
        }
    }
};
exports.NotificationMngController = NotificationMngController;
exports.NotificationMngController = NotificationMngController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('NotificationService')),
    __metadata("design:paramtypes", [notification_service_1.NotificationService])
], NotificationMngController);
