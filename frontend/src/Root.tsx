import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './store/store';
import App from './App.tsx';
import { initializeSocket } from './config/notification.config';
import { QueryClient } from '@tanstack/react-query';
import NotificationPopup from './components/common/NotificationPopup.tsx';
import { clearNotification } from './store/slices/notificationSlice';

interface RootProps {
  queryClient: QueryClient;
}

const Root: React.FC<RootProps> = ({ queryClient }) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const userId = user?.id || null;
  const isAdmin = user?.role === 'admin';
  const isVendor = user?.role === 'vendor';
  const popupNotification = useSelector((state: RootState) => state.popupNotification.currentNotification);
  const dispatch = useDispatch();


  useEffect(() => {
    let socket: ReturnType<typeof initializeSocket> | null = null;
    if (userId) {
      console.log(`Initializing socket for userId: ${userId}, isAdmin: ${isAdmin}, isVendor: ${isVendor}`);
      socket = initializeSocket(userId, isAdmin, isVendor, queryClient);
      socket.on('connect', () => {
        console.log(`Socket connected for userId: ${userId}, socketId: ${socket?.id}`);
      });
      socket.on('connect_error', (error) => {
        console.error(`Socket connection error for userId: ${userId}:`, error.message);
      });
    }
    return () => {
      if (socket) {
        console.log(`Disconnecting socket for userId: ${userId}`);
        socket.disconnect();
      }
    };
  }, [userId, isAdmin, isVendor, queryClient]);

  return (
    <>
      <App />
      {popupNotification && (
        <NotificationPopup
          notification={popupNotification}
          onClose={() => dispatch(clearNotification())}
        />
      )}
      {/* <Toaster /> */}
    </>
  );
};

export default Root;