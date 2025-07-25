// src/presentation/routes/notificationMng.routes.ts
import { Router } from 'express';
import { container } from 'tsyringe';
import { verifyAccessToken } from '../middleware/verifyToken.middleware';
import { authorizeRoles } from '../middleware/rbac.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { CreateGlobalNotificationSchema } from '../validation/notification.validation';
import { INotificationMngController } from '../controllers/interface/notificationMng.controller.interface';

const NotificationMngController = container.resolve<INotificationMngController>(
  'NotificationMngController',
);

const router = Router();

// // POST /api/notifications/global - Create a global notification (Admin only)
// router.post(
//   '/global',
//   verifyAccessToken,
//   authorizeRoles(['admin']),
//   validateRequest(CreateGlobalNotificationSchema),
//   NotificationMngController.createGlobalNotification.bind(NotificationMngController),
// );

// POST /api/notifications/user - Create a user-specific notification (Authenticated User)
// router.post(
//   '/crea-user',
//   verifyAccessToken,
//   validateRequest(CreateUserNotificationSchema),
//   NotificationMngController.createUserNotification.bind(NotificationMngController),
// );

// PATCH /api/notifications/:id/read - Mark a specific notification as read (Authenticated User)
router.patch(
  '/read/:id',
  verifyAccessToken,
  authorizeRoles(['vendor', 'user', 'admin']),
  NotificationMngController.readOneNotification.bind(NotificationMngController),
);

// PATCH /api/notifications/read-all - Mark all notifications as read (Authenticated User)
router.patch(
  '/read-all',
  verifyAccessToken,
  authorizeRoles(['vendor', 'user']),
  NotificationMngController.readAllNotification.bind(NotificationMngController),
);

router.patch(
  '/read-all-admin',
  verifyAccessToken,
  authorizeRoles(['admin']),
  NotificationMngController.readAllAdminNotification.bind(NotificationMngController),
);

// GET /api/notifications/user - Fetch all notifications for the authenticated user
router.get(
  '/user',
  verifyAccessToken,
  authorizeRoles(['user', 'vendor']),
  NotificationMngController.fetchAllUserNotification.bind(NotificationMngController),
);

// POST /api/notifications/vendor - Create a vendor-specific notification (Admin or Vendor Management)
// router.post(
//   '/vendor',
//   verifyAccessToken,
//   authorizeRoles(['admin']),
//   validateRequest(CreateVendorNotificationSchema),
//   NotificationMngController.createVendorNotification.bind(NotificationMngController),
// );

// GET /api/notifications/vendor/:vendorId - Fetch all notifications for a specific vendor
router.get(
  '/admin',
  verifyAccessToken,
  authorizeRoles(['admin']),
  NotificationMngController.fetchAllAdminNotification.bind(NotificationMngController),
);

// GET /api/notifications/vendors/me - Fetch notifications for the authenticated vendor
// router.get(
//   '/vendors/me',
//   verifyAccessToken,
//   authorizeRoles(['vendor']),
//   NotificationMngController.fetchAllVendorNotification.bind(NotificationMngController),
// );

export default router;
