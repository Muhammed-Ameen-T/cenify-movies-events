import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { ToastContainer, toast } from 'react-toastify';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash ,FaCheck} from 'react-icons/fa';
import { resetPasswordSchema, otpSchema, newPasswordSchema } from '../../validation/schema';
import { requestPasswordReset, verifyResetOtp, updatePassword } from '../../services/Vendor/api';

type EmailFormData = z.infer<typeof resetPasswordSchema>;
type OtpFormData = z.infer<typeof otpSchema>;
type PasswordFormData = z.infer<typeof newPasswordSchema>;

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, staggerChildren: 0.1 }
  },
  exit: { opacity: 0, y: -20 }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const PasswordResetPage: React.FC = () => {
  const navigate = useNavigate();
  const [stage, setStage] = useState<'email' | 'otp' | 'newPassword' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Email Form
  const {
    register: emailRegister,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors },
  } = useForm<EmailFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  // OTP Form
  const {
    register: otpRegister,
    handleSubmit: handleOtpSubmit,
    setValue: setOtpValue,
    formState: { errors: otpErrors },
    watch: watchOtp,
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  });

  // Password Form
  const {
    register: passwordRegister,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(newPasswordSchema),
  });

  // Request Reset Mutation
  const requestResetMutation = useMutation({
    mutationFn: requestPasswordReset,
    onSuccess: (_, variables) => {
      setEmail(variables.email);
      setStage('otp');
      setResendTimer(30);
      toast.success('Reset code sent to your email!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send reset code');
    },
  });

  // Verify OTP Mutation
  const verifyOtpMutation = useMutation({
    mutationFn: verifyResetOtp,
    onSuccess: () => {
      setStage('newPassword');
      toast.success('Code verified successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Invalid verification code');
    },
  });

  // Update Password Mutation
  const updatePasswordMutation = useMutation({
    mutationFn: updatePassword,
    onSuccess: () => {
      setStage('success');
      toast.success('Password updated successfully!');
      setTimeout(() => {
        navigate('/vendor/login');
      }, 2000);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update password');
    },
  });

  // Handle OTP input change
  const handleOtpChange = useCallback((index: number, value: string) => {
    if (/^\d?$/.test(value)) {
      const currentOtp = watchOtp('otp') || '';
      const newOtp = currentOtp.padEnd(6, ' ').split('');
      newOtp[index] = value;
      const otpString = newOtp.join('').trim();
      setOtpValue('otp', otpString);

      if (value && index < 5) {
        otpRefs.current[index + 1]?.focus();
      }
    }
  }, [watchOtp, setOtpValue]);

  // Handle OTP paste
  const handleOtpPaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      setOtpValue('otp', pastedData);
      otpRefs.current[5]?.focus();
    }
  }, [setOtpValue]);

  // Handle OTP backspace
  const handleOtpKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      const currentOtp = watchOtp('otp') || '';
      if (!currentOtp[index] && index > 0) {
        otpRefs.current[index - 1]?.focus();
      }
    }
  }, [watchOtp]);

  // Form submission handlers
  const onEmailSubmit = (data: EmailFormData) => {
    requestResetMutation.mutate({ email: data.email });
  };

  const onOtpSubmit = (data: OtpFormData) => {
    verifyOtpMutation.mutate({ email, otp: data.otp });
  };

  const onPasswordSubmit = (data: PasswordFormData) => {
    updatePasswordMutation.mutate({
      email,
      password: data.password,
      confirmPassword: data.confirmPassword,
    });
  };

  return (
    <motion.div 
      className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-blue-900 py-12 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ToastContainer />
      <motion.div 
        className="w-full max-w-md"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <motion.div 
          className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl overflow-hidden"
          variants={itemVariants}
        >
          <AnimatePresence mode="wait">
            {stage === 'email' && (
              <motion.div
                key="email"
                className="p-8"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <motion.h2 
                  className="text-2xl font-bold text-white mb-2 text-center"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Reset Your Password
                </motion.h2>
                <motion.p 
                  className="text-gray-400 text-center mb-8"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Enter your email to receive a verification code
                </motion.p>

                <form onSubmit={handleEmailSubmit(onEmailSubmit)} className="space-y-6">
                  <motion.div className="space-y-2" variants={itemVariants}>
                    <label htmlFor="email" className="text-sm font-medium text-gray-300">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <FaEnvelope className="text-gray-400" />
                      </div>
                      <input
                        {...emailRegister('email')}
                        type="email"
                        className={`w-full pl-10 pr-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 focus:outline-none ${
                          emailErrors.email ? 'border-red-500' : ''
                        }`}
                        placeholder="Enter your email"
                      />
                      {emailErrors.email && (
                        <p className="mt-1 text-sm text-red-400">{emailErrors.email.message}</p>
                      )}
                    </div>
                  </motion.div>

                  <motion.button
                    type="submit"
                    className="w-full py-4 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center justify-center"
                    disabled={requestResetMutation.isPending}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {requestResetMutation.isPending ? (
                      <>
                        <motion.div
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        Sending...
                      </>
                    ) : (
                      "Send Reset Code"
                    )}
                  </motion.button>
                </form>
              </motion.div>
            )}

            {stage === 'otp' && (
              <motion.div
                key="otp"
                className="p-8"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <motion.h2 
                  className="text-2xl font-bold text-white mb-2 text-center"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Enter Verification Code
                </motion.h2>
                <motion.p 
                  className="text-gray-400 text-center mb-8"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  We've sent a 6-digit code to<br />
                  <span className="font-medium text-blue-400">{email}</span>
                </motion.p>

                <form onSubmit={handleOtpSubmit(onOtpSubmit)} className="space-y-6">
                  <motion.div className="flex justify-center space-x-3" variants={itemVariants}>
                    {Array.from({ length: 6 }).map((_, index) => (
                      <input
                        key={index}
                        ref={el => otpRefs.current[index] = el}
                        type="text"
                        maxLength={1}
                        className="w-12 h-12 text-center text-xl font-bold rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                        onChange={e => handleOtpChange(index, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(index, e)}
                        onPaste={index === 0 ? handleOtpPaste : undefined}
                      />
                    ))}
                  </motion.div>

                  {otpErrors.otp && (
                    <p className="text-red-400 text-sm text-center">{otpErrors.otp.message}</p>
                  )}

                  <motion.button
                    type="submit"
                    className="w-full py-4 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center justify-center"
                    disabled={verifyOtpMutation.isPending}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {verifyOtpMutation.isPending ? (
                      <>
                        <motion.div
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        Verifying...
                      </>
                    ) : (
                      "Verify Code"
                    )}
                  </motion.button>

                  <motion.div className="text-center" variants={itemVariants}>
                    <button
                      type="button"
                      onClick={() => setStage('email')}
                      className="text-sm text-blue-400 hover:text-blue-300 mr-4"
                    >
                      Change Email
                    </button>
                    <button
                      type="button"
                      className={`text-sm ${
                        resendTimer > 0 ? 'text-gray-500 cursor-not-allowed' : 'text-blue-400 hover:text-blue-300'
                      }`}
                      disabled={resendTimer > 0}
                    >
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                    </button>
                  </motion.div>
                </form>
              </motion.div>
            )}

            {stage === 'newPassword' && (
              <motion.div
                key="password"
                className="p-8"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <motion.h2 
                  className="text-2xl font-bold text-white mb-2 text-center"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Create New Password
                </motion.h2>
                <motion.p 
                  className="text-gray-400 text-center mb-8"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Your password must be at least 8 characters
                </motion.p>

                <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">
                  <motion.div className="space-y-2" variants={itemVariants}>
                    <label htmlFor="password" className="text-sm font-medium text-gray-300">
                      New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <FaLock className="text-gray-400" />
                      </div>
                      <input
                        {...passwordRegister('password')}
                        type={showPassword ? 'text' : 'password'}
                        className={`w-full pl-10 pr-12 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 focus:outline-none ${
                          passwordErrors.password ? 'border-red-500' : ''
                        }`}
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                      {passwordErrors.password && (
                        <p className="mt-1 text-sm text-red-400">{passwordErrors.password.message}</p>
                      )}
                    </div>
                  </motion.div>

                  <motion.div className="space-y-2" variants={itemVariants}>
                    <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-300">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <FaLock className="text-gray-400" />
                      </div>
                      <input
                        {...passwordRegister('confirmPassword')}
                        type={showConfirmPassword ? 'text' : 'password'}
                        className={`w-full pl-10 pr-12 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 focus:outline-none ${
                          passwordErrors.confirmPassword ? 'border-red-500' : ''
                        }`}
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                      {passwordErrors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-400">{passwordErrors.confirmPassword.message}</p>
                      )}
                    </div>
                  </motion.div>

                  <motion.button
                    type="submit"
                    className="w-full py-4 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center justify-center"
                    disabled={updatePasswordMutation.isPending}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {updatePasswordMutation.isPending ? (
                      <>
                        <motion.div
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        Updating...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </motion.button>
                </form>
              </motion.div>
            )}

            {stage === 'success' && (
              <motion.div
                key="success"
                className="p-8 text-center"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <motion.div
                  className="w-16 h-16 mx-auto mb-6 bg-green-500 rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                >
                  <FaCheck className="w-8 h-8 text-white" />
                </motion.div>

                <motion.h2 
                  className="text-2xl font-bold text-white mb-4"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Password Reset Successful!
                </motion.h2>
                
                <motion.p 
                  className="text-gray-400 mb-8"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Your password has been updated successfully.<br />
                  Redirecting to login...
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default PasswordResetPage;