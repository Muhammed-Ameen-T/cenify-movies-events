// src/components/UserProfile/AccountTab.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Edit, Lock, ChevronRight } from 'lucide-react';
import { UserProfile } from '../../types';

interface AccountTabProps {
  user: UserProfile;
  isLoading: boolean;
  onEditProfile: () => void;
  onChangePassword: () => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AccountTab: React.FC<AccountTabProps> = ({
  user,
  isLoading,
  onEditProfile,
  onChangePassword,
  onImageUpload,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Use user directly, with minimal fallbacks to avoid overriding valid data
  const safeUser: UserProfile = {
    id: user.id || '',
    name: user.name || 'N/A',
    email: user.email || 'N/A',
    phone: user.phone || 'N/A',
    dateOfBirth: user.dateOfBirth || 'N/A',
    joinedDate: user.joinedDate || new Date().toISOString(),
    loyaltyPoints: user.loyaltyPoints ?? 0, // Use nullish coalescing to preserve 0
    profileImage: user.profileImage || 'https://via.placeholder.com/150',
    role: user.role || 'user',
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 },
    },
  };

  const ShimmerUI = () => (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="bg-white rounded-xl p-6 shadow-lg">
        <div className="h-8 w-1/4 bg-gray-200 rounded animate-shimmer mb-4"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gray-200 animate-shimmer"></div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gray-200 rounded-full animate-shimmer"></div>
          </div>
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(6)].map((_, index) => (
                <div key={index}>
                  <div className="h-4 w-1/2 bg-gray-200 rounded animate-shimmer mb-2"></div>
                  <div className="h-5 w-3/4 bg-gray-200 rounded animate-shimmer"></div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <div className="h-10 w-32 bg-gray-200 rounded-lg animate-shimmer"></div>
              <div className="h-10 w-40 bg-gray-200 rounded-lg animate-shimmer"></div>
            </div>
          </div>
        </div>
      </motion.div>
      <motion.div variants={itemVariants} className="bg-white rounded-xl p-6 shadow-lg">
        <div className="h-6 w-1/4 bg-gray-200 rounded animate-shimmer mb-4"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b">
              <div>
                <div className="h-5 w-32 bg-gray-200 rounded animate-shimmer mb-2"></div>
                <div className="h-4 w-48 bg-gray-200 rounded animate-shimmer"></div>
              </div>
              <div className="h-6 w-11 bg-gray-200 rounded-full animate-shimmer"></div>
            </div>
          ))}
        </div>
      </motion.div>
      <motion.div variants={itemVariants} className="bg-white rounded-xl p-6 shadow-lg">
        <div className="h-6 w-1/4 bg-gray-200 rounded animate-shimmer mb-4"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg"
            >
              <div className="h-5 w-32 bg-gray-200 rounded animate-shimmer"></div>
              <div className="h-5 w-5 bg-gray-200 rounded animate-shimmer"></div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );

  if (isLoading) {
    return <ShimmerUI />;
  }

  return (
    <>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-6"
      >
        <motion.div variants={itemVariants} className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Profile Overview</h2>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <motion.div whileHover={{ scale: 1.05 }} className="relative">
              <img
                src={safeUser.profileImage}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-[#FFCC00] cursor-pointer"
                onClick={() => setIsModalOpen(true)}
              />
            </motion.div>
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium text-gray-900">{safeUser.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{safeUser.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">{safeUser.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="font-medium text-gray-900">
                    {safeUser.dateOfBirth !== 'N/A'
                      ? new Date(safeUser.dateOfBirth).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium text-gray-900">
                    {safeUser.joinedDate
                      ? new Date(safeUser.joinedDate).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Loyalty Points</p>
                  <p className="font-medium text-gray-900 flex items-center">
                    <Star className="w-4 h-4 text-[#FFCC00] mr-1 inline" fill="currentColor" />
                    {safeUser.loyaltyPoints} points
                  </p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onEditProfile}
                  className="bg-[#FFCC00] hover:bg-[#FFBB00] text-gray-900 py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Edit size={16} /> Edit Profile
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onChangePassword}
                  className="bg-white border border-[#FFCC00] text-gray-900 hover:bg-[#FFF8E0] py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Lock size={16} /> Change Password
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Account Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <h3 className="font-medium text-gray-900">Email Notifications</h3>
                <p className="text-sm text-gray-500">Receive email about new releases and offers</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#FFF8E0] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FFCC00]"></div>
              </label>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <h3 className="font-medium text-gray-900">Push Notifications</h3>
                <p className="text-sm text-gray-500">Get notifications about your bookings</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#FFF8E0] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FFCC00]"></div>
              </label>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-500">Add an extra layer of security</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#FFF8E0] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FFCC00]"></div>
              </label>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Privacy & Security</h2>
          <div className="space-y-4">
            <button
              onClick={onChangePassword}
              className="w-full text-left flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="font-medium text-gray-900">Change Password</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            <button className="w-full text-left flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <span className="font-medium text-gray-900">Privacy Settings</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            <button className="w-full text-left flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <span className="font-medium text-gray-900">Delete Account</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-transparent flex items-center justify-center z-50 backdrop-blur-xs"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-lg p-4 max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <img
                  src={safeUser.profileImage}
                  alt="Enlarged Profile"
                  className="w-full max-h-[70vh] object-contain rounded-lg"
                />
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-2 right-2 bg-gray-800 text-white rounded-full p-2 hover:bg-gray-700"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AccountTab;