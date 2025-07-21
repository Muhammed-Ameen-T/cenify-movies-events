import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Loader2, User, Phone, Calendar } from 'lucide-react';
import { UserProfile } from '../../types';
import { sendOtpPhone, verifyOtpPhone } from '../../services/User/profileApi';
import { toast } from 'react-hot-toast';
import { RootState } from '../../store/store';
import { useSelector } from 'react-redux';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  previewImage: string | null;
  onSave: (updatedProfile: Partial<UserProfile>) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onImageUpload,
  previewImage,
  onSave,
}) => {
  const [editedProfile, setEditedProfile] = useState<UserProfile>({ ...profile });
  const [errors, setErrors] = useState<Partial<Record<keyof UserProfile | 'otp', string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [timer, setTimer] = useState(60);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const user = useSelector((state: RootState) => state.auth.user);

  // Initialize state when profile prop changes or modal opens
  useEffect(() => {
    console.log('ProfileModal: Initializing with profile:', profile);
    const initializedProfile: UserProfile = {
      name: profile.name || '',
      email: profile.email || '',
      phone: profile.phone || null,
      profileImage: profile.profileImage || null,
      dateOfBirth: profile.dateOfBirth || null,
    };
    setEditedProfile(initializedProfile);
    setErrors({});
    setIsOtpSent(false);
    setIsOtpVerified(false);
    setOtp('');
    setTimer(60);
    setIsResendDisabled(true);
  }, [profile, isOpen]);

  // Update editedProfile when previewImage changes
  useEffect(() => {
    if (previewImage && previewImage !== editedProfile.profileImage) {
      console.log('ProfileModal: Updating editedProfile with previewImage:', previewImage);
      setEditedProfile((prev) => ({ ...prev, profileImage: previewImage }));
    }
  }, [previewImage]);

  // Timer logic for OTP
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isOtpSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          const newTimer = prev - 1;
          if (newTimer === 0) {
            setIsResendDisabled(false);
          }
          return newTimer;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOtpSent, timer]);

  // Format date for input
  const formatDate = (date: string | null): string => {
    if (!date || date === 'N/A') return '';
    const parsedDate = new Date(date);
    return isNaN(parsedDate.getTime()) ? '' : parsedDate.toISOString().split('T')[0];
  };

  // Check if phone number has changed
  const isPhoneChanged = (): boolean => {
    const originalPhone = String(profile.phone || '').trim();
    const newPhone = String(editedProfile.phone || '').trim();
    const changed = originalPhone !== newPhone && newPhone !== '';
    console.log('ProfileModal: isPhoneChanged:', { originalPhone, newPhone, changed });
    return changed;
  };

  // Check if any field has changed
  const hasChanges = (): boolean => {
    const nameChanged = (editedProfile.name || '').trim() !== (profile.name || '').trim();
    const phoneChanged = isPhoneChanged();
    const imageChanged = (editedProfile.profileImage || '') !== (user?.profileImage || '');
    const dobChanged = (editedProfile.dateOfBirth || '') !== (profile.dateOfBirth || '');
    const changesDetected = nameChanged || phoneChanged || imageChanged || dobChanged;
    console.log('ProfileModal: hasChanges:', {
      nameChanged,
      phoneChanged,
      imageChanged,
      dobChanged,
      changesDetected,
      editedProfileProfileImage: editedProfile.profileImage,
      profileProfileImage: profile.profileImage,
      previewImage,
    });
    return changesDetected;
  };

  // Validate basic form fields (excluding OTP)
  const validateBasicFields = (): boolean => {
    const newErrors: Partial<Record<keyof UserProfile | 'otp', string>> = {};

    if (!editedProfile.name?.trim()) {
      newErrors.name = 'Name is required';
    } else if (editedProfile.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (
      editedProfile.phone !== 'N/A' &&
      String(editedProfile.phone).trim().length >= 1 &&
      !/^\d{10}$/.test(String(editedProfile.phone).trim())
    ) {
      newErrors.phone = `Phone number must be exactly 10 digits ${editedProfile.phone?.trim()}`;
    }

    setErrors(newErrors);
    console.log('ProfileModal: validateBasicFields errors:', newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate OTP
  const validateOtp = (): boolean => {
    if (!/^\d{6}$/.test(otp.trim())) {
      setErrors((prev) => ({ ...prev, otp: 'OTP must be 6 digits' }));
      return false;
    }
    setErrors((prev) => ({ ...prev, otp: undefined }));
    return true;
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedProfile((prev) => {
      const updated = { ...prev, [name]: value || null };
      console.log('ProfileModal: handleChange:', { name, value, updated });
      return updated;
    });

    // Clear error for the changed field
    setErrors((prev) => ({ ...prev, [name]: undefined }));

    // If phone number is changed, reset OTP state
    if (name === 'phone') {
      setIsOtpSent(false);
      setIsOtpVerified(false);
      setOtp('');
      setTimer(60);
      setIsResendDisabled(true);
    }
  };

  // Handle OTP input change
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setOtp(value);

    // Clear OTP error when user types
    if (errors.otp) {
      setErrors((prev) => ({ ...prev, otp: undefined }));
    }
  };

  // Send OTP for phone number
  const handleSendOtp = async () => {
    if (!editedProfile.phone?.trim()) {
      setErrors((prev) => ({ ...prev, phone: 'Phone number is required for OTP' }));
      return;
    }

    if (!/^\d{10}$/.test(editedProfile.phone.trim())) {
      setErrors((prev) => ({ ...prev, phone: 'Phone number must be exactly 10 digits' }));
      return;
    }

    try {
      setIsSubmitting(true);
      await sendOtpPhone(editedProfile.phone.trim());
      setIsOtpSent(true);
      setIsOtpVerified(false);
      setTimer(60);
      setIsResendDisabled(true);
      toast.success('OTP sent to your phone number');
    } catch (error: any) {
      console.error('ProfileModal: sendOtpPhone error:', error);
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!editedProfile.phone?.trim()) {
      setErrors((prev) => ({ ...prev, phone: 'Phone number is required for OTP' }));
      return;
    }

    try {
      setIsSubmitting(true);
      await sendOtpPhone(editedProfile.phone.trim());
      setTimer(60);
      setIsResendDisabled(true);
      toast.success('OTP resent to your phone number');
    } catch (error: any) {
      console.error('ProfileModal: resendOtpPhone error:', error);
      toast.error(error.message || 'Failed to resend OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    if (!validateOtp()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await verifyOtpPhone(editedProfile.phone!.trim(), otp.trim());
      setIsOtpVerified(true);
      toast.success('Phone number verified successfully');

      // Immediately save the profile after OTP verification
      const updateData: Partial<UserProfile> = {
        name: editedProfile.name?.trim() || '',
        phone: String(editedProfile.phone)?.trim() || null,
        profileImage: editedProfile.profileImage || null,
        dob: editedProfile.dateOfBirth || null,
      };
      console.log('ProfileModal: Saving profile after OTP verification:', updateData);
      onSave(updateData);
    } catch (error: any) {
      console.error('ProfileModal: verifyOtpPhone error:', error);
      setErrors((prev) => ({ ...prev, otp: error.message || 'Invalid OTP' }));
      toast.error(error.message || 'Failed to verify OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate basic fields
    if (!validateBasicFields()) {
      return;
    }

    // Check if there are any changes
    if (!hasChanges()) {
      toast.error('No changes to save');
      return;
    }

    const phoneChanged = isPhoneChanged();

    // If phone number has changed, handle OTP flow
    if (phoneChanged && editedProfile.phone) {
      if (!isOtpSent) {
        console.log('ProfileModal: Phone changed, sending OTP');
        await handleSendOtp();
        return;
      }

      if (!isOtpVerified) {
        console.log('ProfileModal: Phone changed, verifying OTP');
        await handleVerifyOtp();
        return;
      }
    }

    // If no phone change or phone is verified, proceed with profile update
    try {
      setIsSubmitting(true);
      const updateData: Partial<UserProfile> = {
        name: editedProfile.name?.trim() || '',
        phone: String(editedProfile.phone)?.trim() || null,
        profileImage: editedProfile.profileImage || null,
        dob: editedProfile.dateOfBirth || null,
      };
      console.log('ProfileModal: Saving profile:', updateData);
      onSave(updateData);
    } catch (error: any) {
      console.error('ProfileModal: Error saving profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get submit button text based on current state
  const getSubmitButtonText = () => {
    if (isSubmitting) return 'Processing...';

    const phoneChanged = isPhoneChanged();

    if (phoneChanged && editedProfile.phone && !isOtpVerified) {
      if (!isOtpSent) return 'Send OTP';
      return 'Verify OTP';
    }

    return 'Save Changes';
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-hidden"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-gray-200/50 w-full max-w-lg h-auto max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative">
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

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex justify-center mb-5">
                <motion.div whileHover={{ scale: 1.02 }} className="relative group">
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

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2"
                  >
                    <div className="p-1 bg-blue-100 rounded-lg">
                      <User className="w-3 h-3 text-blue-600" />
                    </div>
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={editedProfile.name || ''}
                    onChange={handleChange}
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
                      className="mt-1 text-xs text-red-600 font-medium"
                    >
                      {errors.name}
                    </motion.p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2"
                  >
                    <div className="p-1 bg-purple-100 rounded-lg">
                      <svg
                        className="w-3 h-3 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                        />
                      </svg>
                    </div>
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={editedProfile.email || ''}
                    disabled
                    className="w-full px-3 py-3 rounded-lg border-2 border-gray-200 bg-gray-100/80 text-gray-500 cursor-not-allowed backdrop-blur-sm font-medium"
                    placeholder="Email cannot be changed"
                  />
                  <p className="mt-1 text-xs text-gray-500 font-medium">
                    Email cannot be modified for security
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="phone"
                      className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2"
                    >
                      <div className="p-1 bg-green-100 rounded-lg">
                        <Phone className="w-3 h-3 text-green-600" />
                      </div>
                      Phone
                      {isPhoneChanged() && (
                        <span className="ml-1 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                          Changed
                        </span>
                      )}
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={
                        !editedProfile || editedProfile.phone === 'N/A'
                          ? ''
                          : editedProfile.phone
                      }
                      onChange={handleChange}
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

                    {/* OTP verification status */}
                    {isPhoneChanged() && editedProfile.phone && (
                      <div className="mt-2">
                        {isOtpVerified ? (
                          <div className="flex items-center gap-2 text-green-600 text-sm">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Phone number verified
                          </div>
                        ) : isOtpSent ? (
                          <div className="text-blue-600 text-sm">OTP sent - Please verify below</div>
                        ) : (
                          <div className="text-orange-600 text-sm">
                            Phone number changed - Verification required
                          </div>
                        )}
                      </div>
                    )}

                    {/* OTP Input Section */}
                    <AnimatePresence>
                      {isOtpSent && isPhoneChanged() && !isOtpVerified && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-3 space-y-2"
                        >
                          <label
                            htmlFor="otp"
                            className="flex items-center gap-2 text-sm font-semibold text-gray-700"
                          >
                            <div className="p-1 bg-blue-100 rounded-lg">
                              <svg
                                className="w-3 h-3 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                              </svg>
                            </div>
                            OTP Verification
                          </label>
                          <div className="flex flex-col gap-2">
                            <input
                              type="text"
                              id="otp"
                              value={otp}
                              onChange={handleOtpChange}
                              className={`w-full px-3 py-3 rounded-lg border-2 ${
                                errors.otp ? 'border-red-500 bg-red-50/50' : 'border-gray-200 bg-white/80'
                              } focus:ring-2 focus:ring-yellow-400/20 focus:border-yellow-400 transition-all duration-300 backdrop-blur-sm font-medium text-gray-900 placeholder-gray-500`}
                              placeholder="Enter 6-digit OTP"
                              disabled={isSubmitting}
                              maxLength={6}
                            />
                            {errors.otp && (
                              <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-xs text-red-600 font-medium"
                              >
                                {errors.otp}
                              </motion.p>
                            )}
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">
                                {timer > 0 ? `Resend in ${timer}s` : 'Resend available'}
                              </span>
                              <motion.button
                                whileHover={{ scale: isResendDisabled || isSubmitting ? 1 : 1.02 }}
                                whileTap={{ scale: isResendDisabled || isSubmitting ? 1 : 0.98 }}
                                type="button"
                                onClick={handleResendOtp}
                                className={`px-3 py-1 text-sm bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300 ${
                                  isResendDisabled || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                disabled={isResendDisabled || isSubmitting}
                              >
                                Resend
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div>
                    <label
                      htmlFor="dateOfBirth"
                      className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2"
                    >
                      <div className="p-1 bg-orange-100 rounded-lg">
                        <Calendar className="w-3 h-3 text-orange-600" />
                      </div>
                      Birth Date
                    </label>
                    <input
                      type="date"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      value={formatDate(editedProfile.dateOfBirth)}
                      onChange={handleChange}
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
                      {getSubmitButtonText()}
                    </>
                  ) : (
                    getSubmitButtonText()
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProfileModal;