import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Notification } from '../../types';

interface NotificationsTabProps {
  notifications: Notification[];
}

const NotificationsTab: React.FC<NotificationsTabProps> = ({ notifications }) => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1 
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Notifications</h2>
          <button className="text-sm text-[#FFCC00] hover:text-[#FFBB00] font-medium">
            Mark all as read
          </button>
        </div>
        <div className="space-y-4">
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              variants={itemVariants}
              className={`p-4 rounded-lg ${notification.read ? 'bg-white' : 'bg-[#FFF8E0]'} border ${notification.read ? 'border-gray-200' : 'border-[#FFDD66]'}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-3">
                  {!notification.read && (
                    <span className="bg-[#FFCC00] h-2 w-2 rounded-full mt-2"></span>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                    <p className="text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notification.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-500">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-6">
          <button className="text-[#FFCC00] hover:text-[#FFBB00] font-medium">
            Load more notifications
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default NotificationsTab;