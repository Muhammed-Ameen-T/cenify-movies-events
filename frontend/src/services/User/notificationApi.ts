// src/services/notification/notificationApi.ts
import api from '../../config/axios.config';
import { NOTIFICATION_MESSAGES } from '../../constants/auth.messages';
import { NOTIFICATION_ENDPOINTS } from '../../constants/apiEndPoint';
import { handleAxiosError } from '../../utils/exios-error-handler';
import { Notification } from '../../types'; // Assuming Notification type is defined in types

interface CreateGlobalNotificationData {
  title: string;
  description: string;
  type: string;
}

interface CreateUserNotificationData {
  title: string;
  description: string;
  type: string;
}

interface CreateVendorNotificationData {
  vendorId: string;
  title: string;
  description: string;
  type: string;
}

interface FetchNotificationsParams {
  page: number;
  limit: number;
  filter?: 'all' | 'read' | 'unread';
}

interface FetchNotificationsResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
  readCount: number;
}


// Create a global notification (Admin only)
export const createGlobalNotification = async (data: CreateGlobalNotificationData): Promise<Notification> => {
  try {
    const response = await api.post(NOTIFICATION_ENDPOINTS.global, data);
    if (!response.data?.success) {
      throw new Error(response.data?.message || NOTIFICATION_MESSAGES.CREATE_GLOBAL_FAILED);
    }
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, NOTIFICATION_MESSAGES.CREATE_GLOBAL_FAILED);
  }
};

// Create a user-specific notification
export const createUserNotification = async (data: CreateUserNotificationData): Promise<Notification> => {
  try {
    const response = await api.post(NOTIFICATION_ENDPOINTS.user, data);
    if (!response.data?.success) {
      throw new Error(response.data?.message || NOTIFICATION_MESSAGES.CREATE_USER_FAILED);
    }
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, NOTIFICATION_MESSAGES.CREATE_USER_FAILED);
  }
};

// Create a vendor-specific notification
export const createVendorNotification = async (data: CreateVendorNotificationData): Promise<Notification> => {
  try {
    const response = await api.post(NOTIFICATION_ENDPOINTS.vendor, data);
    if (!response.data?.success) {
      throw new Error(response.data?.message || NOTIFICATION_MESSAGES.CREATE_VENDOR_FAILED);
    }
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, NOTIFICATION_MESSAGES.CREATE_VENDOR_FAILED);
  }
};

// Mark a specific notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    const response = await api.patch(`${NOTIFICATION_ENDPOINTS.readOne}/${notificationId}`);
    if (!response.data?.success) {
      throw new Error(response.data?.message || NOTIFICATION_MESSAGES.MARK_READ_FAILED);
    }
  } catch (error) {
    handleAxiosError(error, NOTIFICATION_MESSAGES.MARK_READ_FAILED);
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (): Promise<void> => {
  try {
    const response = await api.patch(NOTIFICATION_ENDPOINTS.readAll);
    if (!response.data?.success) {
      throw new Error(response.data?.message || NOTIFICATION_MESSAGES.MARK_ALL_READ_FAILED);
    }
  } catch (error) {
    handleAxiosError(error, NOTIFICATION_MESSAGES.MARK_ALL_READ_FAILED);
    throw error;
  }
};

// Mark all notifications as read
export const markAllAdminNotificationsAsRead = async (): Promise<void> => {
  try {
    const response = await api.patch(NOTIFICATION_ENDPOINTS.readAllAdmin);
    if (!response.data?.success) {
      throw new Error(response.data?.message || NOTIFICATION_MESSAGES.MARK_ALL_READ_FAILED);
    }
  } catch (error) {
    handleAxiosError(error, NOTIFICATION_MESSAGES.MARK_ALL_READ_FAILED);
  }
};

// Fetch all notifications for the authenticated user
export const fetchAllUserNotifications = async ({
  page = 1,
  limit = 5,
  filter = 'all',
}: FetchNotificationsParams): Promise<FetchNotificationsResponse> => {
  try {
    const response = await api.get(NOTIFICATION_ENDPOINTS.user, {
      params: { page, limit, filter },
    });
    if (!response.data?.success) {
      throw new Error(response.data?.message || NOTIFICATION_MESSAGES.FETCH_NOTIFICATIONS_FAILED);
    }
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, NOTIFICATION_MESSAGES.FETCH_NOTIFICATIONS_FAILED);
  }
};

export const fetchAllAdminNotifications = async ({
  page = 1,
  limit = 5,
  filter = 'all',
}: FetchNotificationsParams): Promise<FetchNotificationsResponse> => {
  try {
    const response = await api.get(NOTIFICATION_ENDPOINTS.admin, {
      params: { page, limit, filter },
    });
    if (!response.data?.success) {
      throw new Error(response.data?.message || NOTIFICATION_MESSAGES.FETCH_NOTIFICATIONS_FAILED);
    }
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, NOTIFICATION_MESSAGES.FETCH_NOTIFICATIONS_FAILED);
  }
};

// Fetch all notifications for a specific vendor
export const fetchVendorNotifications = async (vendorId: string): Promise<Notification[]> => {
  try {
    const response = await api.get(`${NOTIFICATION_ENDPOINTS.vendor}/${vendorId}`);
    if (!response.data?.success) {
      throw new Error(response.data?.message || NOTIFICATION_MESSAGES.FETCH_NOTIFICATIONS_FAILED);
    }
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, NOTIFICATION_MESSAGES.FETCH_NOTIFICATIONS_FAILED);
  }
};

// Fetch notifications for the authenticated vendor
export const fetchCurrentVendorNotifications = async (): Promise<Notification[]> => {
  try {
    const response = await api.get(NOTIFICATION_ENDPOINTS.currentVendor);
    if (!response.data?.success) {
      throw new Error(response.data?.message || NOTIFICATION_MESSAGES.FETCH_NOTIFICATIONS_FAILED);
    }
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, NOTIFICATION_MESSAGES.FETCH_NOTIFICATIONS_FAILED);
  }
};