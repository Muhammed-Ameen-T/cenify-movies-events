"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/presentation/routes/notificationMng.routes.ts
const express_1 = require("express");
const tsyringe_1 = require("tsyringe");
const verifyToken_middleware_1 = require("../middleware/verifyToken.middleware");
const rbac_middleware_1 = require("../middleware/rbac.middleware");
const NotificationMngController = tsyringe_1.container.resolve('NotificationMngController');
const router = (0, express_1.Router)();
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
router.patch('/read/:id', verifyToken_middleware_1.verifyAccessToken, (0, rbac_middleware_1.authorizeRoles)(['vendor', 'user', 'admin']), NotificationMngController.readOneNotification.bind(NotificationMngController));
// PATCH /api/notifications/read-all - Mark all notifications as read (Authenticated User)
router.patch('/read-all', verifyToken_middleware_1.verifyAccessToken, (0, rbac_middleware_1.authorizeRoles)(['vendor', 'user']), NotificationMngController.readAllNotification.bind(NotificationMngController));
router.patch('/read-all-admin', verifyToken_middleware_1.verifyAccessToken, (0, rbac_middleware_1.authorizeRoles)(['admin']), NotificationMngController.readAllAdminNotification.bind(NotificationMngController));
// GET /api/notifications/user - Fetch all notifications for the authenticated user
router.get('/user', verifyToken_middleware_1.verifyAccessToken, (0, rbac_middleware_1.authorizeRoles)(['user', 'vendor']), NotificationMngController.fetchAllUserNotification.bind(NotificationMngController));
// POST /api/notifications/vendor - Create a vendor-specific notification (Admin or Vendor Management)
// router.post(
//   '/vendor',
//   verifyAccessToken,
//   authorizeRoles(['admin']),
//   validateRequest(CreateVendorNotificationSchema),
//   NotificationMngController.createVendorNotification.bind(NotificationMngController),
// );
// GET /api/notifications/vendor/:vendorId - Fetch all notifications for a specific vendor
router.get('/admin', verifyToken_middleware_1.verifyAccessToken, (0, rbac_middleware_1.authorizeRoles)(['admin']), NotificationMngController.fetchAllAdminNotification.bind(NotificationMngController));
// GET /api/notifications/vendors/me - Fetch notifications for the authenticated vendor
// router.get(
//   '/vendors/me',
//   verifyAccessToken,
//   authorizeRoles(['vendor']),
//   NotificationMngController.fetchAllVendorNotification.bind(NotificationMngController),
// );
exports.default = router;
