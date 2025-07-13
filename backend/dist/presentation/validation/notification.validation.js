"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadOneNotificationSchema = exports.CreateVendorNotificationSchema = exports.CreateUserNotificationSchema = exports.CreateGlobalNotificationSchema = void 0;
// src/presentation/validation/notification.validation.ts
const zod_1 = require("zod");
// Schema for creating a global notification
exports.CreateGlobalNotificationSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required'),
    description: zod_1.z.string().min(1, 'Description is required'),
    type: zod_1.z.string().min(1, 'Type is required'),
});
// Schema for creating a user-specific notification
exports.CreateUserNotificationSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required'),
    description: zod_1.z.string().min(1, 'Description is required'),
    type: zod_1.z.string().min(1, 'Type is required'),
});
// Schema for creating a vendor-specific notification
exports.CreateVendorNotificationSchema = zod_1.z.object({
    vendorId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid vendorId format'),
    title: zod_1.z.string().min(1, 'Title is required'),
    description: zod_1.z.string().min(1, 'Description is required'),
    type: zod_1.z.string().min(1, 'Type is required'),
});
// Schema for marking a specific notification as read
exports.ReadOneNotificationSchema = zod_1.z.object({
    id: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid notificationId format'),
});
