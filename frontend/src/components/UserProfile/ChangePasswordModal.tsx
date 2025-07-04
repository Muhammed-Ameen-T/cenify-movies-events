import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Eye, EyeOff, Shield, Key } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { changePassword } from '../../services/User/profileApi';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

interface FormErrors {
  oldPassword?: string;
  newPassword?: string;
  confirmNewPassword?: string;
}

const PasswordModal: React.FC<PasswordModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState<FormData>({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const mutation = useMutation({
    mutationFn: () => changePassword({ oldPassword: formData.oldPassword, newPassword: formData.newPassword }),
    onSuccess: () => {
      toast.success('Password changed successfully!');
      setFormData({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
      setErrors({});
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to change password');
    },
  });

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};
    if (!formData.oldPassword) {
      newErrors.oldPassword = 'Current password is required';
    }
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'New password must be at least 6 characters';
    }
    if (formData.newPassword !== formData.confirmNewPassword) {
      newErrors.confirmNewPassword = 'Passwords do not match';
    }
    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for the field being edited
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    mutation.mutate();
  };

  const togglePasswordVisibility = (field: 'old' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  if (!isOpen) return null;

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
            className="bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200/50 w-full max-w-lg relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-red-400/10 to-red-600/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-red-300/10 to-red-500/10 rounded-full blur-2xl transform -translate-x-1/4 translate-y-1/4"></div>
            
            <div className="relative">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-red-400 to-red-600 rounded-xl">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Change Password</h2>
                    <p className="text-sm text-gray-600 mt-1">Update your account security</p>
                  </div>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose} 
                  className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                  disabled={mutation.isLoading}
                >
                  <X className="w-6 h-6 text-gray-600" />
                </motion.button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Current Password */}
                <div>
                  <label htmlFor="oldPassword" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <div className="p-1 bg-blue-100 rounded-lg">
                      <Key className="w-4 h-4 text-blue-600" />
                    </div>
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.old ? 'text' : 'password'}
                      id="oldPassword"
                      name="oldPassword"
                      value={formData.oldPassword}
                      onChange={handleChange}
                      className={`w-full px-4 py-4 pr-12 rounded-xl border-2 ${
                        errors.oldPassword ? 'border-red-500 bg-red-50/50' : 'border-gray-200 bg-white/80'
                      } focus:ring-4 focus:ring-red-400/20 focus:border-red-400 transition-all duration-300 backdrop-blur-sm font-medium text-gray-900 placeholder-gray-500`}
                      placeholder="Enter current password"
                      disabled={mutation.isLoading}
                    />
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => togglePasswordVisibility('old')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showPasswords.old ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </motion.button>
                  </div>
                  {errors.oldPassword && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-600 text-sm mt-2 font-medium"
                    >
                      {errors.oldPassword}
                    </motion.p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label htmlFor="newPassword" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <div className="p-1 bg-green-100 rounded-lg">
                      <Lock className="w-4 h-4 text-green-600" />
                    </div>
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className={`w-full px-4 py-4 pr-12 rounded-xl border-2 ${
                        errors.newPassword ? 'border-red-500 bg-red-50/50' : 'border-gray-200 bg-white/80'
                      } focus:ring-4 focus:ring-green-400/20 focus:border-green-400 transition-all duration-300 backdrop-blur-sm font-medium text-gray-900 placeholder-gray-500`}
                      placeholder="Enter new password"
                      disabled={mutation.isLoading}
                    />
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </motion.button>
                  </div>
                  {errors.newPassword && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-600 text-sm mt-2 font-medium"
                    >
                      {errors.newPassword}
                    </motion.p>
                  )}
                </div>

                {/* Confirm New Password */}
                <div>
                  <label htmlFor="confirmNewPassword" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <div className="p-1 bg-purple-100 rounded-lg">
                      <Shield className="w-4 h-4 text-purple-600" />
                    </div>
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      id="confirmNewPassword"
                      name="confirmNewPassword"
                      value={formData.confirmNewPassword}
                      onChange={handleChange}
                      className={`w-full px-4 py-4 pr-12 rounded-xl border-2 ${
                        errors.confirmNewPassword ? 'border-red-500 bg-red-50/50' : 'border-gray-200 bg-white/80'
                      } focus:ring-4 focus:ring-purple-400/20 focus:border-purple-400 transition-all duration-300 backdrop-blur-sm font-medium text-gray-900 placeholder-gray-500`}
                      placeholder="Confirm new password"
                      disabled={mutation.isLoading}
                    />
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </motion.button>
                  </div>
                  {errors.confirmNewPassword && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-600 text-sm mt-2 font-medium"
                    >
                      {errors.confirmNewPassword}
                    </motion.p>
                  )}
                </div>

                
                {/* Action Buttons */}
                <div className="pt-6 flex flex-col sm:flex-row gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-4 px-6 border-2 border-gray-200 text-gray-700 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50/80 rounded-xl transition-all duration-300 font-semibold backdrop-blur-sm shadow-lg hover:shadow-xl"
                    disabled={mutation.isLoading}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: mutation.isLoading ? 1 : 1.02, y: mutation.isLoading ? 0 : -2 }}
                    whileTap={{ scale: mutation.isLoading ? 1 : 0.98 }}
                    type="submit"
                    className={`flex-1 py-4 px-6 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all duration-300 flex items-center justify-center font-semibold shadow-xl hover:shadow-2xl ${
                      mutation.isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={mutation.isLoading}
                  >
                    {mutation.isLoading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 mr-3 border-2 border-white border-t-transparent rounded-full"
                        />
                        Updating Password...
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5 mr-2" />
                        Update Password
                      </>
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

export default PasswordModal;