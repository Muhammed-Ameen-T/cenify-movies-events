import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Calendar } from 'lucide-react';
import { formatRelativeTime } from '../../utils/timeFormator';
import { RootState } from '../../store/store';
import { useSelector } from 'react-redux';

interface Notification {
  _id: string;
  userId?: string;
  title: string;
  type: string;
  description: string;
  bookingId?: string;
  createdAt: Date;
  isRead: boolean;
  isGlobal?: boolean;
}

interface NotificationPopupProps {
  notification: Notification;
  onClose: () => void;
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const user = useSelector((state: RootState) => state.auth.user);
  const isDarkTheme = user?.role === 'admin' || user?.role === 'vendor';

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for animation to complete
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const handleClick = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 100, y: -20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 100, y: -20 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          className={`fixed top-4 right-4 w-80 rounded-2xl shadow-2xl border p-4 z-50 backdrop-blur-xl
            ${isDarkTheme
              ? 'bg-gradient-to-br from-slate-800 to-slate-700 text-white border-slate-600/70'
              : 'bg-white/90 text-gray-900 border-gray-200/50'
            }`}
          role="alert"
          aria-labelledby={`notification-${notification._id}-title`}
        >
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg flex-shrink-0 ${isDarkTheme ? 'bg-indigo-500 text-white' : 'bg-blue-500 text-white'}`}>
              <Bell className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3
                  id={`notification-${notification._id}-title`}
                  className="text-lg font-bold"
                >
                  {notification.title}
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleClick}
                  className={`${isDarkTheme ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                  aria-label="Close notification"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
              <p className="text-sm mt-1 line-clamp-2">
                {notification.description}
              </p>
              <div className="flex items-center gap-2 text-xs mt-2 text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>{formatRelativeTime(notification.createdAt)}</span>
              </div>
            </div>
          </div>
          <motion.div
            className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: 5, ease: 'linear' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationPopup;
