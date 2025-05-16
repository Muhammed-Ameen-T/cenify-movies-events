// src/components/UserProfile/ProfileModal.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Loader2 } from 'lucide-react';
import { UserProfile } from '../../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  errors: Partial<Record<keyof UserProfile, string>>;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  previewImage: string | null;
  isSubmitting: boolean;
}

const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onChange,
  onSubmit,
  errors,
  onImageUpload,
  previewImage,
  isSubmitting,
}) => {
  if (!isOpen) return null;

  const formatDate = (date: string | null): string => {
    if (!date || date === 'N/A') {
      return '';
    }
    const parsedDate = new Date(date);
    return isNaN(parsedDate.getTime()) ? '' : parsedDate.toISOString().split('T')[0];
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl p-6 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Edit Profile</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500" disabled={isSubmitting}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <img
                    src={previewImage || profile.profileImage || 'https://via.placeholder.com/150'}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-[#FFCC00]"
                  />
                  <label className="absolute bottom-0 right-0 bg-[#FFCC00] text-gray-900 p-2 rounded-full cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={onImageUpload}
                      className="hidden"
                      disabled={isSubmitting}
                    />
                    <Upload size={16} />
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={profile.name ?? ''}
                  onChange={onChange}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  } focus:ring-2 focus:ring-[#FFCC00] focus:border-[#FFCC00] bg-white text-gray-900`}
                  disabled={isSubmitting}
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profile.email ?? ''}
                  disabled
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={profile.phone ?? ''}
                  onChange={onChange}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  } focus:ring-2 focus:ring-[#FFCC00] focus:border-[#FFCC00] bg-white text-gray-900`}
                  disabled={isSubmitting}
                />
                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
              </div>

              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formatDate(profile.dateOfBirth)}
                  onChange={onChange}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                  } focus:ring-2 focus:ring-[#FFCC00] focus:border-[#FFCC00] bg-white text-gray-900`}
                  disabled={isSubmitting}
                />
                {errors.dateOfBirth && <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>}
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: isSubmitting ? 1 : 1.03 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.97 }}
                  type="submit"
                  className={`flex-1 py-2 px-4 bg-[#FFCC00] hover:bg-[#FFBB00] text-gray-900 rounded-lg transition-colors flex items-center justify-center ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProfileModal;