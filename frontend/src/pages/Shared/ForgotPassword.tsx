import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaCheck } from 'react-icons/fa';
import { resetPasswordSchema, otpSchema, newPasswordSchema } from '../../validation/schema';
import { requestPasswordReset, verifyResetOtp, updatePassword } from '../../services/Vendor/api';

type EmailFormData = z.infer<typeof resetPasswordSchema>;
type OtpFormData = z.infer<typeof otpSchema>;
type PasswordFormData = z.infer<typeof newPasswordSchema>;

const PasswordResetPage: React.FC = () => {
  const navigate = useNavigate();
  const [stage, setStage] = useState<'email' | 'otp' | 'newPassword' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Debug stage changes
  useEffect(() => {
    console.log('Current stage:', stage);
  }, [stage]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [resendTimer]);

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
  const handleOtpChange = useCallback(
    (index: number, value: string) => {
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
    },
    [watchOtp, setOtpValue]
  );

  // Handle OTP paste
  const handleOtpPaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
      if (pastedData.length === 6) {
        setOtpValue('otp', pastedData);
        otpRefs.current[5]?.focus();
      }
    },
    [setOtpValue]
  );

  // Handle OTP backspace
  const handleOtpKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent) => {
      if (e.key === 'Backspace') {
        const currentOtp = watchOtp('otp') || '';
        if (!currentOtp[index] && index > 0) {
          otpRefs.current[index - 1]?.focus();
        }
      }
    },
    [watchOtp]
  );

  // Handle resend code
  const handleResendCode = () => {
    requestResetMutation.mutate({ email });
    setResendTimer(30);
  };

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
    <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        theme="light"
      />
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
          {stage === 'email' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">Forgot Password</h2>
              <p className="text-gray-600 text-center mb-8">
                Enter your email to receive a verification code
              </p>
              <form onSubmit={handleEmailSubmit(onEmailSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <FaEnvelope className="text-gray-400 h-5 w-5" />
                    </div>
                    <input
                      {...emailRegister('email')}
                      type="email"
                      className="w-full pl-10 pr-4 py-3 rounded-lg bg-white border-2 border-gray-500 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none shadow-md ring-1 ring-gray-300"
                      placeholder="Enter your email"
                    />
                  </div>
                  {emailErrors.email && (
                    <p className="mt-1 text-sm text-red-500">{emailErrors.email.message}</p>
                  )}
                </div>
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-opacity-50 flex items-center justify-center disabled:bg-gray-300 disabled:cursor-not-allowed"
                  disabled={requestResetMutation.isPending}
                >
                  {requestResetMutation.isPending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    'Send Code'
                  )}
                </button>
              </form>
            </div>
          )}

          {stage === 'otp' && (
            <div className="bg-blue-50"> {/* Temporary background for debugging */}
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">
                Enter Verification Code
              </h2>
              <p className="text-gray-600 text-center mb-8">
                We've sent a 6-digit code to<br />
                <span className="font-medium text-yellow-500">{email}</span>
              </p>
              <form onSubmit={handleOtpSubmit(onOtpSubmit)} className="space-y-6">
                <div className="flex justify-center space-x-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <input
                      key={index}
                      ref={(el) => (otpRefs.current[index] = el)}
                      type="text"
                      maxLength={1}
                      className="w-12 h-12 text-center text-xl font-semibold rounded-lg bg-white border-2 border-gray-500 text-gray-900 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none shadow-md ring-1 ring-gray-300"
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={index === 0 ? handleOtpPaste : undefined}
                    />
                  ))}
                </div>
                {otpErrors.otp && (
                  <p className="text-red-500 text-sm text-center">{otpErrors.otp.message}</p>
                )}
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-opacity-50 flex items-center justify-center disabled:bg-gray-300 disabled:cursor-not-allowed"
                  disabled={verifyOtpMutation.isPending}
                >
                  {verifyOtpMutation.isPending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mr-2" />
                      Verifying...
                    </>
                  ) : (
                    'Verify Code'
                  )}
                </button>
                <div className="text-center text-sm space-x-4">
                  <button
                    type="button"
                    onClick={() => setStage('email')}
                    className="text-yellow-500 hover:text-yellow-600 transition-colors duration-200"
                  >
                    Change Email
                  </button>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    className={`${
                      resendTimer > 0
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-yellow-500 hover:text-yellow-600'
                    } transition-colors duration-200`}
                    disabled={resendTimer > 0}
                  >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {stage === 'newPassword' && (
            <div className="bg-green-50"> {/* Temporary background for debugging */}
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">
                Create New Password
              </h2>
              <p className="text-gray-600 text-center mb-8">
                Your password must be at least 8 characters
              </p>
              <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <FaLock className="text-gray-400 h-5 w-5" />
                    </div>
                    <input
                      {...passwordRegister('password')}
                      type={showPassword ? 'text' : 'password'}
                      className="w-full pl-10 pr-12 py-3 rounded-lg bg-white border-2 border-gray-500 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none shadow-md ring-1 ring-gray-300"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                    </button>
                    {passwordErrors.password && (
                      <p className="mt-1 text-sm text-red-500">{passwordErrors.password.message}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <FaLock className="text-gray-400 h-5 w-5" />
                    </div>
                    <input
                      {...passwordRegister('confirmPassword')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="w-full pl-10 pr-12 py-3 rounded-lg bg-white border-2 border-gray-500 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none shadow-md ring-1 ring-gray-300"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                    </button>
                    {passwordErrors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-500">{passwordErrors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-opacity-50 flex items-center justify-center disabled:bg-gray-300 disabled:cursor-not-allowed"
                  disabled={updatePasswordMutation.isPending}
                >
                  {updatePasswordMutation.isPending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </button>
              </form>
            </div>
          )}

          {stage === 'success' && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-yellow-400 rounded-full flex items-center justify-center">
                <FaCheck className="w-8 h-8 text-gray-900" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Password Reset Successful!</h2>
              <p className="text-gray-600 mb-8">
                Your password has been updated successfully.<br />
                Redirecting to login...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PasswordResetPage;