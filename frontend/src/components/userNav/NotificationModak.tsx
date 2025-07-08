import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: number;
  message: string;
  date: string;
  read: boolean;
}

interface NotificationDropdownProps {
  notifications: Notification[];
  notificationCount: number;
  isNotificationOpen: boolean;
  setIsNotificationOpen: (open: boolean) => void;
  setNotifications: (notifications: Notification[]) => void;
  setNotificationCount: (count: number) => void;
  notificationRef: React.RefObject<HTMLDivElement>;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  notificationCount,
  isNotificationOpen,
  setIsNotificationOpen,
  setNotifications,
  setNotificationCount,
  notificationRef,
}) => {
  const navigate = useNavigate();

  const handleMarkAllAsRead = () => {
    const updatedNotifications = notifications.map((notification) => ({
      ...notification,
      read: true,
    }));
    setNotifications(updatedNotifications);
    setNotificationCount(0);
  };

  return (
    <div className="relative" ref={notificationRef}>
      <AnimatePresence>
        {isNotificationOpen && (
          <motion.div
            className="absolute top-4 right-0 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg border border-yellow-100 overflow-hidden z-50"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {/* Header */}
            <div className="flex justify-between items-center px-4 py-3 bg-gradient-to-r from-white via-yellow-50 to-orange-50 border-b border-yellow-100">
              <h3 className="font-bold text-gray-800 text-sm">Notifications</h3>
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs font-medium text-yellow-600 hover:text-yellow-700 transition-all duration-300"
              >
                Mark all as read
              </button>
            </div>

            {/* Notification List */}
            <div className="max-h-72 overflow-y-auto hide-scrollbar" style={{ scrollbarWidth: 'none' }}>
              {notifications.length === 0 ? (
                <div className="py-6 text-center text-gray-600 text-sm">No notifications</div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 border-b border-yellow-50 cursor-pointer transition-all duration-300 ${
                      notification.read
                        ? 'bg-white/80 backdrop-blur-sm hover:bg-gray-100'
                        : 'bg-gradient-to-r from-yellow-50 to-orange-50 hover:bg-yellow-100'
                    }`}
                    onClick={() => {
                      const updatedNotifications = notifications.map((n) =>
                        n.id === notification.id ? { ...n, read: true } : n
                      );
                      setNotifications(updatedNotifications);
                      setNotificationCount(notifications.filter((n) => !n.read).length - 1);
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <p className="text-sm text-gray-800 font-medium">{notification.message}</p>
                      {!notification.read && (
                        <span className="h-2 w-2 rounded-full bg-yellow-500 mt-1 ml-2 flex-shrink-0"></span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{notification.date}</p>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-2 bg-gradient-to-r from-white via-yellow-50 to-orange-50 border-t border-yellow-100">
              <button
                onClick={() => {
                  navigate('/notifications');
                  setIsNotificationOpen(false);
                }}
                className="w-full py-2 text-sm text-center text-yellow-600 hover:text-yellow-700 font-medium bg-white/80 backdrop-blur-sm rounded-xl transition-all duration-300 hover:bg-gray-100 hover:shadow-md"
              >
                View All Notifications
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;