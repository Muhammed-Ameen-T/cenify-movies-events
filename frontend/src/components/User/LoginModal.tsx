// src/components/LoginModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, ArrowLeft, Loader2 } from 'lucide-react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useDispatch } from 'react-redux';
import { setAuth } from '../../store/slices/authSlice';
import { startLoading, stopLoading } from '../../store/slices/loadingSlice';
import { sendOtp, verifyOtp, googleLogin, login } from '../../services/User/authApi';
import { z } from 'zod';
import { showSuccessToast, showErrorToast } from '../../utils/toast'; 

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'register' | 'otp-verification';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const otpSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, 'Please enter a valid 6-digit code'),
});

type ValidationErrors = {
  [key: string]: string;
};

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(60); 
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [isResendLoading, setIsResendLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (authMode === 'otp-verification' && resendTimer > 0 && isResendDisabled) {
      timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setIsResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [authMode, resendTimer, isResendDisabled]);

  const validateLoginForm = (): boolean => {
    try {
      loginSchema.parse({ email, password });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: ValidationErrors = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          formattedErrors[path] = err.message;
        });
        setErrors(formattedErrors);
      }
      return false;
    }
  };

  const validateRegisterForm = (): boolean => {
    try {
      registerSchema.parse({ name, email, password });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: ValidationErrors = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          formattedErrors[path] = err.message;  
        });
        setErrors(formattedErrors);
      }
      return false;
    }
  };

  const validateOtp = (): boolean => {
    try {
      otpSchema.parse({ otp });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: ValidationErrors = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          formattedErrors[path] = err.message;
        });
        setErrors(formattedErrors);
      }
      return false;
    }
  };

  const handleLogin = async () => {
    if (!validateLoginForm()) {
      return;
    }

    setIsLoginLoading(true);
    dispatch(startLoading());

    try {
      const response = await login(email, password);

      dispatch(
        setAuth({
          user: { 
            ...response.user,
            // phone: response.user.phone ? parseInt(response.user.phone, 10) : null,
          },
          accessToken: response.accessToken,
        })
      );
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('user', JSON.stringify(response.user));
      onClose();
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : 'Login failed. Please check your credentials.');
    } finally {
      setIsLoginLoading(false);
      dispatch(stopLoading());
    }
  };

  const handleRegister = async () => {
    if (!validateRegisterForm()) {
      return;
    }

    setIsRegisterLoading(true);
    dispatch(startLoading());

    try {
      await sendOtp(email);
      setAuthMode('otp-verification');
      setResendTimer(60);
      setIsResendDisabled(true);
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : 'Failed to send verification OTP');
    } finally {
      setIsRegisterLoading(false);
      dispatch(stopLoading());
    }
  };

  const handleVerifyOtp = async () => {
    if (!validateOtp()) {
      return;
    }

    setIsOtpLoading(true);
    dispatch(startLoading());

    try {
      const response = await verifyOtp(name, email, otp, password);
      dispatch(
        setAuth({
          user: {
            ...response.user,
          },
          accessToken: response.accessToken,
        })
      );
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('user', JSON.stringify(response.user));
      onClose();
      showSuccessToast('Registration successful!');
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : 'Verification failed. Please try again.');
    } finally {
      setIsOtpLoading(false);
      dispatch(stopLoading());
    }
  };

  const handleResendOtp = async () => {
    setIsResendLoading(true);
    dispatch(startLoading());

    try {
      await sendOtp(email);
      setResendTimer(60);
      setIsResendDisabled(true);
      showSuccessToast('Verification code resent successfully!');
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : 'Failed to resend OTP');
    } finally {
      setIsResendLoading(false);
      dispatch(stopLoading());
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    const idToken = credentialResponse.credential;
    setIsGoogleLoading(true);
    dispatch(startLoading());

    try {
      const response = await googleLogin(idToken);
      dispatch(
        setAuth({
          user: {
            ...response.user,
          },
          accessToken: response.accessToken,
        })
      );
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('user', JSON.stringify(response.user));
      onClose();
      showSuccessToast('Google login successful!');
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : 'Google login failed.');
    } finally {
      setIsGoogleLoading(false);
      dispatch(stopLoading());
    }
  };

  const handleGoogleError = () => {
    showErrorToast('Google login failed. Please try again or use another method.');
  };

  const switchToLogin = () => {
    setErrors({});
    setAuthMode('login');
  };

  const switchToRegister = () => {
    setErrors({});
    setAuthMode('register');
  };

  const goBack = () => {
    setErrors({});
    setAuthMode('register');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
        <div className="flex justify-between items-center mb-6">
          {authMode === 'otp-verification' && (
            <button
              onClick={goBack}
              className="text-gray-600 hover:text-gray-800 flex items-center"
              disabled={isOtpLoading || isResendLoading}
            >
              <ArrowLeft size={20} className="mr-1" />
              <span>Back</span>
            </button>
          )}
          <h2 className="text-xl font-bold">
            {authMode === 'login' ? 'Sign In' : authMode === 'register' ? 'Create Account' : 'Verify Email'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
            disabled={isLoginLoading || isRegisterLoading || isOtpLoading || isResendLoading || isGoogleLoading}
          >
            <X size={24} />
          </button>
        </div>

        {authMode === 'login' && (
          <div className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 border ${
                      errors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-2 ${
                      errors.email ? 'focus:ring-red-400' : 'focus:ring-yellow-400'
                    }`}
                    placeholder="Enter your email"
                    disabled={isLoginLoading || isGoogleLoading}
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-10 pr-14 py-2 border ${
                      errors.password ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-2 ${
                      errors.password ? 'focus:ring-red-400' : 'focus:ring-yellow-400'
                    }`}
                    placeholder="Enter your password"
                    disabled={isLoginLoading || isGoogleLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isLoginLoading || isGoogleLoading}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>
            </div>

            <button
              onClick={handleLogin}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-800 px-4 py-3 rounded-md focus:outline-none font-medium transition-colors flex items-center justify-center"
              disabled={isLoginLoading || isGoogleLoading}
            >
              {isLoginLoading ? (
                <>
                  <Loader2 size={20} className="mr-2 animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="mx-4 text-gray-500 text-sm">OR</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <div className="flex justify-center">
              <GoogleOAuthProvider clientId="613444320769-rjcuif05i13je3gth1o494trk0nkkrnk.apps.googleusercontent.com">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="outline"
                  size="large"
                  shape="pill"
                  width="100%"
                  disabled={isLoginLoading || isGoogleLoading}
                />
              </GoogleOAuthProvider>
            </div>

            <div className="text-center mt-4 text-sm">
              Don't have an account?{' '}
              <button
                onClick={switchToRegister}
                className="text-yellow-600 hover:underline font-medium"
                disabled={isLoginLoading || isGoogleLoading}
              >
                Create Account
              </button>
            </div>
          </div>
        )}

        {authMode === 'register' && (
          <div className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 border ${
                      errors.name ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-2 ${
                      errors.name ? 'focus:ring-red-400' : 'focus:ring-yellow-400'
                    }`}
                    placeholder="Enter your full name"
                    disabled={isRegisterLoading || isGoogleLoading}
                  />
                </div>
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 border ${
                      errors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-2 ${
                      errors.email ? 'focus:ring-red-400' : 'focus:ring-yellow-400'
                    }`}
                    placeholder="Enter your email"
                    disabled={isRegisterLoading || isGoogleLoading}
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-10 pr-14 py-2 border ${
                      errors.password ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-2 ${
                      errors.password ? 'focus:ring-red-400' : 'focus:ring-yellow-400'
                    }`}
                    placeholder="Create a password (min. 8 characters)"
                    disabled={isRegisterLoading || isGoogleLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isRegisterLoading || isGoogleLoading}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {errors.password ? (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters</p>
                )}
              </div>
            </div>

            <button
              onClick={handleRegister}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-800 px-4 py-3 rounded-md focus:outline-none font-medium transition-colors flex items-center justify-center"
              disabled={isRegisterLoading || isGoogleLoading}
            >
              {isRegisterLoading ? (
                <>
                  <Loader2 size={20} className="mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account & Verify Email'
              )}
            </button>

            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="mx-4 text-gray-500 text-sm">OR</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <div className="flex justify-center">
              <GoogleOAuthProvider clientId="613444320769-rjcuif05i13je3gth1o494trk0nkkrnk.apps.googleusercontent.com">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="outline"
                  size="large"
                  shape="pill"
                  width="100%"
                  disabled={isRegisterLoading || isGoogleLoading}
                />
              </GoogleOAuthProvider>
            </div>

            <div className="text-center mt-4 text-sm">
              Already have an account?{' '}
              <button
                onClick={switchToLogin}
                className="text-yellow-600 hover:underline font-medium"
                disabled={isRegisterLoading || isGoogleLoading}
              >
                Sign In
              </button>
            </div>
          </div>
        )}

        {authMode === 'otp-verification' && (
          <div className="space-y-4">
            <p className="text-gray-600 text-sm mb-4">
              We've sent a verification code to <span className="font-medium">{email}</span>. Please enter the
              6-digit code below to verify your email.
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                className={`w-full px-4 py-2 border ${
                  errors.otp ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-2 ${
                  errors.otp ? 'focus:ring-red-400' : 'focus:ring-yellow-400'
                } text-center text-lg tracking-wider`}
                placeholder="Enter 6-digit code"
                disabled={isOtpLoading || isResendLoading}
                maxLength={6}
              />
              {errors.otp && <p className="mt-1 text-sm text-red-600">{errors.otp}</p>}
            </div>

            <button
              onClick={handleVerifyOtp}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-800 px-4 py-3 rounded-md focus:outline-none font-medium transition-colors flex items-center justify-center"
              disabled={isOtpLoading || isResendLoading}
            >
              {isOtpLoading ? (
                <>
                  <Loader2 size={20} className="mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify & Complete Registration'
              )}
            </button>

            <div className="text-sm text-center text-gray-600">
              {isResendDisabled ? (
                <span>Resend code in {resendTimer} seconds</span>
              ) : (
                <button
                  onClick={handleResendOtp}
                  className="text-yellow-600 hover:underline flex items-center justify-center mx-auto"
                  disabled={isOtpLoading || isResendLoading}
                >
                  {isResendLoading ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Resend verification code'
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginModal;