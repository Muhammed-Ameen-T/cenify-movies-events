// src/presentation/validation/notification.validation.ts
import { z } from 'zod';

// Schema for creating a global notification
export const CreateGlobalNotificationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  type: z.string().min(1, 'Type is required'),
});

// Schema for creating a user-specific notification
export const CreateUserNotificationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  type: z.string().min(1, 'Type is required'),
});

// Schema for creating a vendor-specific notification
export const CreateVendorNotificationSchema = z.object({
  vendorId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid vendorId format'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  type: z.string().min(1, 'Type is required'),
});

// Schema for marking a specific notification as read
export const ReadOneNotificationSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid notificationId format'),
});
