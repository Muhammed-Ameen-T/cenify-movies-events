import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { QueryClient } from '@tanstack/react-query';
import { Notification } from '../types';
import { showNotification } from '../store/slices/notificationSlice';
import { store } from '../store/store';

export const initializeSocket = (
  userId: string | null,
  isAdmin: boolean,
  isVendor: boolean,
  queryClient: QueryClient
) => {
  const socket = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000', {
    path: '/socket.io',
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log(`Socket connected: ${socket.id}`);
    if (userId) {
      socket.emit('joinNotificationRoom', `user-${userId}`);
      console.log(`Emitted joinNotificationRoom for user-${userId}`);
      if (isVendor) {
        socket.emit('joinNotificationRoom', `vendor-${userId}`);
        console.log(`Emitted joinNotificationRoom for vendor-${userId}`);
      }
    }
    if (isAdmin) {
      socket.emit('joinNotificationRoom', 'admin-global');
      console.log(`Emitted joinNotificationRoom for admin-global`);
    }
  });

  socket.on('joinedNotificationRoom', ({ room, socketId }) => {
    console.log(`Confirmed joined room: ${room}, socketId: ${socketId}`);
  });

  socket.on('notification', (notification: Notification) => {
    console.log('Received notification:', notification);

    const normalizedType = notification.type.toLowerCase();

    // Show in popup using Redux
    store.dispatch(showNotification(notification));

    // Update QueryClient cache for user notifications
    if (!['booking', 'theater', 'payment', 'review', 'system', 'alert'].includes(normalizedType) && userId) {
      queryClient.getQueryCache().findAll({ queryKey: ['notifications', userId] }).forEach(({ queryKey }) => {
        queryClient.setQueryData(queryKey, (oldData: any) => {
          if (!oldData) {
            return {
              notifications: [notification],
              total: 1,
              unreadCount: notification.isRead ? 0 : 1,
              readCount: notification.isRead ? 1 : 0,
            };
          }
          return {
            ...oldData,
            notifications: [notification, ...oldData.notifications],
            total: oldData.total + 1,
            unreadCount: oldData.unreadCount + (notification.isRead ? 0 : 1),
            readCount: oldData.readCount + (notification.isRead ? 1 : 0),
          };
        });
      });
    }

    // Update QueryClient cache for vendor notifications
    if (['booking', 'theater', 'payment', 'review', 'system', 'alert'].includes(normalizedType) && userId) {
      queryClient.getQueryCache().findAll({ queryKey: ['vendor-notifications', userId] }).forEach(({ queryKey }) => {
        queryClient.setQueryData(queryKey, (oldData: any) => {
          const vendorNotification = {
            id: notification._id || '',
            title: notification.title,
            message: notification.description,
            date: notification.createdAt.toString(),
            read: notification.isRead,
            type: normalizedType,
          };
          if (!oldData) {
            return {
              notifications: [vendorNotification],
              total: 1,
              unreadCount: notification.isRead ? 0 : 1,
              readCount: notification.isRead ? 1 : 0,
            };
          }
          return {
            ...oldData,
            notifications: [vendorNotification, ...oldData.notifications],
            total: oldData.total + 1,
            unreadCount: oldData.unreadCount + (notification.isRead ? 0 : 1),
            readCount: oldData.readCount + (notification.isRead ? 1 : 0),
          };
        });
      });
    }

    // Update QueryClient cache for admin notifications
    if (notification.isGlobal && isAdmin) {
      queryClient.getQueryCache().findAll({ queryKey: ['admin-notifications'] }).forEach(({ queryKey }) => {
        queryClient.setQueryData(queryKey, (oldData: any) => {
          const adminNotification = {
            id: notification._id || '',
            title: notification.title,
            message: notification.description,
            date: notification.createdAt.toString(),
            read: notification.isRead,
            type: normalizedType,
          };
          if (!oldData) {
            return {
              notifications: [adminNotification],
              total: 1,
              unreadCount: notification.isRead ? 0 : 1,
              readCount: notification.isRead ? 1 : 0,
            };
          }
          // Apply filter logic to ensure notification matches currentFilter
          const [_, limit, filter] = queryKey;
          if (
            filter === 'all' ||
            (filter === 'unread' && !notification.isRead) ||
            (filter === 'read' && notification.isRead)
          ) {
            return {
              ...oldData,
              notifications: [adminNotification, ...oldData.notifications].slice(0, limit),
              total: oldData.total + 1,
              unreadCount: oldData.unreadCount + (notification.isRead ? 0 : 1),
              readCount: oldData.readCount + (notification.isRead ? 1 : 0),
            };
          }
          return oldData;
        });
      });
    }
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connect_error:', error.message);  
  });

  socket.on('disconnect', (reason) => {
    console.log(`Socket disconnected: ${reason}`);
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
    toast.error('An error occurred with notifications.', {
      duration: 5000,
      position: 'bottom-right',
      style: {
        background: 'linear-gradient(135deg, #ffffff, #f1f5f9)',
        color: '#1f2937',
        border: '1px solid #ef4444',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        padding: '16px',
        maxWidth: '360px',
        fontWeight: '500',
        fontFamily: "'Inter', sans-serif",
      },
      iconTheme: {
        primary: '#ef4444',
        secondary: '#ffffff',
      },
    });
  });

  return socket;
};
