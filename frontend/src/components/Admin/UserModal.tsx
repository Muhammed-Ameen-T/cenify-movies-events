// components/Admin/UserModal.tsx
import React from 'react';
import { X, User as UserIcon, Mail, Phone, Shield, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '../../types/user';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose,  user }) => {
  if (!isOpen) return null;

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 25 },
    },
    exit: { opacity: 0, scale: 0.9, y: 20, transition: { duration: 0.2 } },
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="relative w-full max-w-md p-6 mx-auto bg-gray-900 rounded-xl shadow-2xl border border-gray-800"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="absolute top-3 right-3">
              <motion.button
                onClick={onClose}
                className="p-1 text-gray-400 rounded-full hover:bg-gray-800 hover:text-white focus:outline-none"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            <div className="flex items-center mb-5">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="w-12 h-12 rounded-full mr-4 object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-orange-600 flex items-center justify-center mr-4 text-white font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <h3 className="text-xl font-semibold text-white">{user.name}</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center text-gray-300">
                <Mail className="w-5 h-5 mr-2 text-orange-500" />
                <span>{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center text-gray-300">
                  <Phone className="w-5 h-5 mr-2 text-orange-500" />
                  <span>{user.phone}</span>
                </div>
              )}
              <div className="flex items-center text-gray-300">
                <Shield className="w-5 h-5 mr-2 text-orange-500" />
                <span className="capitalize">{user.role}</span>
              </div>
              <div
                className={`flex items-center ${
                  user.isBlocked ? "text-red-500" : "text-green-500"
                }`}
              >
                <UserIcon
                  className={`w-5 h-5 mr-2 ${user.isBlocked ? "text-red-500" : "text-green-500"}`}
                />
                <span className="capitalize">{user.isBlocked ? "Blocked" : "Active"}</span>
              </div>  
              <div className="flex items-center text-gray-300">
                <Calendar className="w-5 h-5 mr-2 text-orange-500" />
                <span>Joined {formatDate(user.createdAt)}</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UserModal;