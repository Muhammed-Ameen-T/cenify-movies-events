// src/presentation/controllers/notificationMng/notificationMng.controller.ts
import 'reflect-metadata';
import { NextFunction, Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { sendResponse } from '../../utils/response/sendResponse.utils';
import { HttpResCode, HttpResMsg } from '../../utils/constants/httpResponseCode.utils';
import ERROR_MESSAGES from '../../utils/constants/commonErrorMsg.constants';
import { CustomError } from '../../utils/errors/custom.error';
import { INotificationMngController } from './interface/notificationMng.controller.interface';
import { NotificationService } from '../../infrastructure/services/notification.service';
import { Notification } from '../../domain/entities/notification.entity';

@injectable()
export class NotificationMngController implements INotificationMngController {
  constructor(@inject('NotificationService') private notificationService: NotificationService) {}

  /**
   * @route POST /api/notifications/global
   * @desc Create a new global notification
   * @access Admin
   * @body {string} title - The title of the global notification
   * @body {string} description - The description/content of the global notification
   * @body {string} type - The type of the notification (e.g., 'announcement', 'update')
   */
  async createGlobalNotification(req: Request, res: Response, next:NextFunction): Promise<void> {
    try {
      const { title, description, type } = req.body;

      if (!title || !description || !type) {
        throw new CustomError(
          ERROR_MESSAGES.VALIDATION.MISSING_REQUIRED_FIELDS,
          HttpResCode.BAD_REQUEST,
        );
      }

      await this.notificationService.createGlobalNotification(title, description, type);
      sendResponse(res, HttpResCode.CREATED, HttpResMsg.SUCCESS, {
        message: 'Global notification created successfully',
      });
    } catch (error) {
      next(error)
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
  async createUserNotification(req: Request, res: Response, next:NextFunction): Promise<void> {
    try {
      const userId = req.decoded?.userId;
      if (!userId) {
        throw new CustomError(HttpResMsg.UNAUTHORIZED, HttpResCode.UNAUTHORIZED);
      }

      const { title, description, type } = req.body;

      if (!title || !description || !type) {
        throw new CustomError(
          ERROR_MESSAGES.VALIDATION.MISSING_REQUIRED_FIELDS,
          HttpResCode.BAD_REQUEST,
        );
      }

      const notificationData: Partial<Notification> = {
        userId: userId, // Assign the specific user ID
        title,
        description,
        type,
        isGlobal: false,
      };

      const newNotification = await this.notificationService.createNotification(notificationData);
      sendResponse(res, HttpResCode.CREATED, HttpResMsg.SUCCESS, newNotification);
    } catch (error) {
      next(error)
    }
  }

  /**
   * @route PATCH /api/notifications/:id/read
   * @desc Mark a specific notification as read for the authenticated user
   * @access Authenticated User
   * @param {string} id - The ID of the notification to mark as read
   */
  async readOneNotification(req: Request, res: Response, next:NextFunction): Promise<void> {
    try {
      const { id: notificationId } = req.params;
      const userId = req.decoded?.userId;

      if (!userId) {
        throw new CustomError(HttpResMsg.UNAUTHORIZED, HttpResCode.UNAUTHORIZED);
      }
      if (!notificationId) {
        throw new CustomError(
          ERROR_MESSAGES.VALIDATION.MISSING_REQUIRED_FIELDS,
          HttpResCode.BAD_REQUEST,
        );
      }

      const success = await this.notificationService.markNotificationAsRead(notificationId, userId);
      if (success) {
        sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, {
          message: 'Notification marked as read',
        });
      } else {
        sendResponse(res, HttpResCode.NOT_FOUND, ERROR_MESSAGES.DATABASE.RECORD_NOT_FOUND);
      }
    } catch (error) {
      next(error)
    }
  }

  /**
   * @route PATCH /api/notifications/read-all
   * @desc Mark all notifications as read for the authenticated user
   * @access Authenticated User
   */
  async readAllNotification(req: Request, res: Response, next:NextFunction): Promise<void> {
    try {
      const userId = req.decoded?.userId;
      if (!userId) {
        throw new CustomError(HttpResMsg.UNAUTHORIZED, HttpResCode.UNAUTHORIZED);
      }

      const success = await this.notificationService.markAllNotificationsAsRead(userId);
      if (success) {
        sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, {
          message: 'All notifications marked as read',
        });
      } else {
        sendResponse(
          res,
          HttpResCode.INTERNAL_SERVER_ERROR,
          'Failed to mark all notifications as read',
        );
      }
    } catch (error) {
      next(error)
    }
  }

  async readAllAdminNotification(req: Request, res: Response, next:NextFunction): Promise<void> {
    try {
      const adminId = req.decoded?.userId;
      if (!adminId) {
        throw new CustomError(HttpResMsg.UNAUTHORIZED, HttpResCode.UNAUTHORIZED);
      }

      const success = await this.notificationService.markAllAdminNotificationsAsRead();
      if (success) {
        sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, {
          message: 'All Admin notifications marked as read',
        });
      } else {
        sendResponse(
          res,
          HttpResCode.INTERNAL_SERVER_ERROR,
          'Failed to mark all notifications as read',
        );
      }
    } catch (error) {
      next(error)
    }
  }

  /**
   * @route GET /api/notifications/user
   * @desc Fetch all notifications for the authenticated user (including relevant global ones)
   * @access Authenticated User
   */
  async fetchAllUserNotification(req: Request, res: Response, next:NextFunction): Promise<void> {
    try {
      const userId = req.decoded?.userId;
      if (!userId) {
        throw new CustomError(HttpResMsg.UNAUTHORIZED, HttpResCode.UNAUTHORIZED);
      }

      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 5;
      const filter = (req.query.filter as string) || 'all';

      if (!['all', 'read', 'unread'].includes(filter)) {
        throw new CustomError(
          ERROR_MESSAGES.VALIDATION.MISSING_REQUIRED_FIELDS,
          HttpResCode.BAD_REQUEST,
        );
      }

      const { notifications, total, unreadCount, readCount } =
        await this.notificationService.fetchAllNotifications(userId, page, limit, filter);

      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, {
        notifications,
        total,
        unreadCount,
        readCount,
      });
    } catch (error) {
      next(error)
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
  async createVendorNotification(req: Request, res: Response, next:NextFunction): Promise<void> {
    try {
      // Assuming `vendorId` might come from `req.body` or `req.decoded` based on the auth context.
      // For this example, I'll assume it's passed in the body if an admin is creating it for a specific vendor.
      // If it's the vendor themselves, then req.decoded?.userId would be used and mapped to a vendorId.
      const { title, description, type, vendorId } = req.body;

      if (!title || !description || !type || !vendorId) {
        throw new CustomError(
          ERROR_MESSAGES.VALIDATION.MISSING_REQUIRED_FIELDS,
          HttpResCode.BAD_REQUEST,
        );
      }

      // The service method expects a Notification entity, which the createVendorNotification in service
      // then constructs based on passed parameters. For this, we'll mimic what the service expects.
      await this.notificationService.createVendorNotification(title, description, type);
      sendResponse(res, HttpResCode.CREATED, HttpResMsg.SUCCESS, {
        message: 'Vendor notification created successfully',
      });
    } catch (error) {
      next(error)
    }
  }

  /**
   * @route GET /api/notifications/vendor/:vendorId (or /api/notifications/vendors/me)
   * @desc Fetch all notifications specific to a vendor
   * @access Vendor (needs appropriate authorization check)
   * @param {string} vendorId - The ID of the vendor
   */
  async fetchAllAdminNotification(req: Request, res: Response, next:NextFunction): Promise<void> {
    try {
      const adminId = req.decoded?.userId;
      if (!adminId) {
        throw new CustomError(HttpResMsg.UNAUTHORIZED, HttpResCode.UNAUTHORIZED);
      }
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 5;
      const filter = (req.query.filter as string) || 'all';

      if (!['all', 'read', 'unread'].includes(filter)) {
        throw new CustomError(
          ERROR_MESSAGES.VALIDATION.MISSING_REQUIRED_FIELDS,
          HttpResCode.BAD_REQUEST,
        );
      }

      const { notifications, total, unreadCount, readCount } =
        await this.notificationService.fetchAdminNotifications(page, limit, filter);
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, {
        notifications,
        total,
        unreadCount,
        readCount,
      });
    } catch (error) {
      next(error)
    }
  }
}
