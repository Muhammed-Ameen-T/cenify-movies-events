// src/components/UserProfile/ProfileModal.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Loader2, User, Phone, Calendar } from 'lucide-react';
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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-gray-200/50 w-full max-w-lg max-h-[85vh] relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400/10 to-orange-500/10 rounded-full blur-2xl transform translate-x-1/4 -translate-y-1/4"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-yellow-300/10 to-yellow-500/10 rounded-full blur-xl transform -translate-x-1/4 translate-y-1/4"></div>
            
            <div className="relative">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full"></div>
                  <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose} 
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-300"
                  disabled={isSubmitting}
                >
                  <X className="w-5 h-5 text-gray-600" />
                </motion.button>
              </div>

              <form onSubmit={onSubmit} className="space-y-5">
                {/* Profile Image Section */}
                <div className="flex justify-center mb-5">
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full blur-lg opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                    <div className="relative">
                      <img
                        src={previewImage || profile.profileImage || 'https://via.placeholder.com/150'}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover border-3 border-white shadow-xl relative z-10"
                      />
                      <motion.label 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute -bottom-1 -right-1 bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white p-2 rounded-full cursor-pointer shadow-lg border-2 border-white z-20 transition-all duration-300"
                      >
                        <input
                          type="file"
                          accept="image/*"
                          onChange={onImageUpload}
                          className="hidden"
                          disabled={isSubmitting}
                        />
                        <Upload className="w-3 h-3" />
                      </motion.label>
                    </div>
                  </motion.div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="name" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <div className="p-1 bg-blue-100 rounded-lg">
                        <User className="w-3 h-3 text-blue-600" />
                      </div>
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={profile.name ?? ''}
                      onChange={onChange}
                      className={`w-full px-3 py-3 rounded-lg border-2 ${
                        errors.name ? 'border-red-500 bg-red-50/50' : 'border-gray-200 bg-white/80'
                      } focus:ring-2 focus:ring-yellow-400/20 focus:border-yellow-400 transition-all duration-300 backdrop-blur-sm font-medium text-gray-900 placeholder-gray-500`}
                      placeholder="Enter your full name"
                      disabled={isSubmitting}
                    />
                    {errors.name && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-sm text-red-600 font-medium"
                      >
                        {errors.name}
                      </motion.p>
                    )}
                  </div>

                  {/* Email Address */}
                  <div>
                    <label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <div className="p-1 bg-purple-100 rounded-lg">
                        <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                      </div>
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={profile.email ?? ''}
                      disabled
                      className="w-full px-3 py-3 rounded-lg border-2 border-gray-200 bg-gray-100/80 text-gray-500 cursor-not-allowed backdrop-blur-sm font-medium"
                      placeholder="Email cannot be changed"
                    />
                    <p className="mt-1 text-xs text-gray-500 font-medium">Email cannot be modified for security</p>
                  </div>

                  {/* Phone Number and Date of Birth in Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="phone" className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                        <div className="p-1 bg-green-100 rounded-lg">
                          <Phone className="w-3 h-3 text-green-600" />
                        </div>
                        Phone
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={profile.phone ?? ''}
                        onChange={onChange}
                        className={`w-full px-3 py-3 rounded-lg border-2 ${
                          errors.phone ? 'border-red-500 bg-red-50/50' : 'border-gray-200 bg-white/80'
                        } focus:ring-2 focus:ring-yellow-400/20 focus:border-yellow-400 transition-all duration-300 backdrop-blur-sm font-medium text-gray-900 placeholder-gray-500`}
                        placeholder="Phone number"
                        disabled={isSubmitting}
                      />
                      {errors.phone && (
                        <motion.p 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-1 text-xs text-red-600 font-medium"
                        >
                          {errors.phone}
                        </motion.p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="dateOfBirth" className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                        <div className="p-1 bg-orange-100 rounded-lg">
                          <Calendar className="w-3 h-3 text-orange-600" />
                        </div>
                        Birth Date
                      </label>
                      <input
                        type="date"
                        id="dateOfBirth"
                        name="dateOfBirth"
                        value={formatDate(profile.dateOfBirth)}
                        onChange={onChange}
                        className={`w-full px-3 py-3 rounded-lg border-2 ${
                          errors.dateOfBirth ? 'border-red-500 bg-red-50/50' : 'border-gray-200 bg-white/80'
                        } focus:ring-2 focus:ring-yellow-400/20 focus:border-yellow-400 transition-all duration-300 backdrop-blur-sm font-medium text-gray-900`}
                        disabled={isSubmitting}
                      />
                      {errors.dateOfBirth && (
                        <motion.p 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-1 text-xs text-red-600 font-medium"
                        >
                          {errors.dateOfBirth}
                        </motion.p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 px-4 border-2 border-gray-200 text-gray-700 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50/80 rounded-lg transition-all duration-300 font-semibold backdrop-blur-sm shadow-md hover:shadow-lg"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: isSubmitting ? 1 : 1.02, y: isSubmitting ? 0 : -1 }}
                    whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                    type="submit"
                    className={`flex-1 py-3 px-4 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white rounded-lg transition-all duration-300 flex items-center justify-center font-semibold shadow-lg hover:shadow-xl ${
                      isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProfileModal;