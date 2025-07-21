import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useDispatch } from 'react-redux'; // Added useNavigate
import { setAuth } from '../../store/slices/authSlice';
import { startLoading, stopLoading } from '../../store/slices/loadingSlice';
import { sendOtp, verifyOtp, googleLogin, login } from '../../services/User/authApi';
import { z } from 'zod';
import { showSuccessToast, showErrorToast } from '../../utils/toast';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate(); // Initialize useNavigate

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setAuthMode('login');
      setEmail('');
      setPassword('');
      setName('');
      setOtp('');
      setErrors({});
      setShowPassword(false);
      setResendTimer(60);
      setIsResendDisabled(false);
    }
  }, [isOpen]);

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
          user: { ...response.user },
          accessToken: response.accessToken,
        })
      );
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('user', JSON.stringify(response.user));
      onClose();
    } catch (error) {
      console.log('🚀 ~ handleLogin ~ error:', error);
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
          user: { ...response.user },
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
          user: { ...response.user },
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

  const handleForgotPassword = () => {
    navigate('/forgot-password');
    onClose();
  };

  const getModalTitle = () => {
    switch (authMode) {
      case 'login':
        return 'Welcome Back';
      case 'register':
        return 'Create Account';
      case 'otp-verification':
        return 'Verify Email';
      default:
        return 'Authentication';
    }
  };

  const getModalSubtitle = () => {
    switch (authMode) {
      case 'login':
        return 'Sign in to your account';
      case 'register':
        return 'Join us today';
      case 'otp-verification':
        return 'Enter verification code';
      default:
        return '';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-white via-yellow-50 to-orange-50 border-b border-yellow-100">
              <div className="flex justify-between items-center">
                {authMode === 'otp-verification' && (
                  <button
                    onClick={goBack}
                    className="text-gray-600 hover:text-gray-800 flex items-center transition-colors duration-200"
                    disabled={isOtpLoading || isResendLoading}
                  >
                    <ArrowLeft size={18} className="mr-1" />
                    <span className="text-sm font-medium">Back</span>
                  </button>
                )}
                <div className={`${authMode === 'otp-verification' ? '' : 'flex-1'}`}>
                  <h2 className="text-xl font-bold text-gray-800">{getModalTitle()}</h2>
                  <p className="text-sm text-gray-600 mt-1">{getModalSubtitle()}</p>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-600 hover:text-gray-800 transition-colors duration-200 p-1 rounded-lg hover:bg-white/50"
                  disabled={isLoginLoading || isRegisterLoading || isOtpLoading || isResendLoading || isGoogleLoading}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              {authMode === 'login' && (
                <div className="space-y-5">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                      <div className="relative">
                        <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 ${
                            errors.email
                              ? 'border-red-300 bg-red-50/50 focus:border-red-400 focus:ring-red-400/25'
                              : 'border-gray-200 bg-white/80 focus:border-yellow-400 focus:ring-yellow-400/25'
                          } backdrop-blur-sm text-gray-800 placeholder-gray-500 font-medium text-sm focus:outline-none focus:ring-2 transition-all duration-300 hover:shadow-md`}
                          placeholder="Enter your email address"
                          disabled={isLoginLoading || isGoogleLoading}
                        />
                      </div>
                      {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                      <div className="relative">
                        <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={`w-full pl-10 pr-12 py-3 rounded-xl border-2 ${
                            errors.password
                              ? 'border-red-300 bg-red-50/50 focus:border-red-400 focus:ring-red-400/25'
                              : 'border-gray-200 bg-white/80 focus:border-yellow-400 focus:ring-yellow-400/25'
                          } backdrop-blur-sm text-gray-800 placeholder-gray-500 font-medium text-sm focus:outline-none focus:ring-2 transition-all duration-300 hover:shadow-md`}
                          placeholder="Enter your password"
                          disabled={isLoginLoading || isGoogleLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                          disabled={isLoginLoading || isGoogleLoading}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
                    </div>
                  </div>

                  <button
                    onClick={handleLogin}
                    className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
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

                  <div className="flex items-center my-5">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="mx-4 text-gray-500 text-sm font-medium">OR</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                  </div>

                  <div className="flex justify-center">
                    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
                      <div className="w-full">
                        <GoogleLogin
                          onSuccess={handleGoogleSuccess}
                          onError={handleGoogleError}
                          theme="outline"
                          size="large"
                          shape="pill"
                          width="100%"
                          disabled={isLoginLoading || isGoogleLoading}
                        />
                      </div>
                    </GoogleOAuthProvider>
                  </div>

                  <div className="text-center mt-5 text-sm flex flex-col space-y-2">
                    <button
                      onClick={handleForgotPassword}
                      className="text-yellow-600 hover:text-yellow-700 font-semibold transition-colors duration-200 bg-yellow-50 hover:bg-yellow-100 rounded-lg py-2 px-4"
                      disabled={isLoginLoading || isGoogleLoading}
                    >
                      Forgot Password?
                    </button>
                    <div>
                      <span className="text-gray-600">Don't have an account? </span>
                      <button
                        onClick={switchToRegister}
                        className="text-yellow-600 hover:text-yellow-700 font-semibold transition-colors duration-200"
                        disabled={isLoginLoading || isGoogleLoading}
                      >
                        Create Account
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {authMode === 'register' && (
                <div className="space Sunderland  y-5">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                      <div className="relative">
                        <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 ${
                            errors.name
                              ? 'border-red-300 bg-red-50/50 focus:border-red-400 focus:ring-red-400/25'
                              : 'border-gray-200 bg-white/80 focus:border-yellow-400 focus:ring-yellow-400/25'
                          } backdrop-blur-sm text-gray-800 placeholder-gray-500 font-medium text-sm focus:outline-none focus:ring-2 transition-all duration-300 hover:shadow-md`}
                          placeholder="Enter your full name"
                          disabled={isRegisterLoading || isGoogleLoading}
                        />
                      </div>
                      {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                      <div className="relative">
                        <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 ${
                            errors.email
                              ? 'border-red-300 bg-red-50/50 focus:border-red-400 focus:ring-red-400/25'
                              : 'border-gray-200 bg-white/80 focus:border-yellow-400 focus:ring-yellow-400/25'
                          } backdrop-blur-sm text-gray-800 placeholder-gray-500 font-medium text-sm focus:outline-none focus:ring-2 transition-all duration-300 hover:shadow-md`}
                          placeholder="Enter your email address"
                          disabled={isRegisterLoading || isGoogleLoading}
                        />
                      </div>
                      {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                      <div className="relative">
                        <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={`w-full pl-10 pr-12 py-3 rounded-xl border-2 ${
                            errors.password
                              ? 'border-red-300 bg-red-50/50 focus:border-red-400 focus:ring-red-400/25'
                              : 'border-gray-200 bg-white/80 focus:border-yellow-400 focus:ring-yellow-400/25'
                          } backdrop-blur-sm text-gray-800 placeholder-gray-500 font-medium text-sm focus:outline-none focus:ring-2 transition-all duration-300 hover:shadow-md`}
                          placeholder="Create a password (min. 8 characters)"
                          disabled={isRegisterLoading || isGoogleLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                          disabled={isRegisterLoading || isGoogleLoading}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {errors.password && 
                        <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                      }
                    </div>
                  </div>

                  <button
                    onClick={handleRegister}
                    className="w-full bg-gradient-to-r mt-3 from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
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

                  <div className="flex items-center my-5">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="mx-4 text-gray-500 text-sm font-medium">OR</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                  </div>

                  <div className="flex justify-center">
                    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
                      <div className="w-full">
                        <GoogleLogin
                          onSuccess={handleGoogleSuccess}
                          onError={handleGoogleError}
                          theme="outline"
                          size="large"
                          shape="pill"
                          width="100%"
                          disabled={isRegisterLoading || isGoogleLoading}
                        />
                      </div>
                    </GoogleOAuthProvider>
                  </div>

                  <div className="text-center mt-5 text-sm">
                    <span className="text-gray-600">Already have an account? </span>
                    <button
                      onClick={switchToLogin}
                      className="text-yellow-600 hover:text-yellow-700 font-semibold transition-colors duration-200"
                      disabled={isRegisterLoading || isGoogleLoading}
                    >
                      Sign In
                    </button>
                  </div>
                </div>
              )}

              {authMode === 'otp-verification' && (
                <div className="space-y-5">
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 mb-5">
                    <p className="text-gray-700 text-sm">
                      We've sent a verification code to{' '}
                      <span className="font-semibold text-yellow-800">{email}</span>. Please enter the
                      6-digit code below to verify your email.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Verification Code</label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                      className={`w-full px-4 py-4 rounded-xl border-2 ${
                        errors.otp
                          ? 'border-red-300 bg-red-50/50 focus:border-red-400 focus:ring-red-400/25'
                          : 'border-gray-200 bg-white/80 focus:border-yellow-400 focus:ring-yellow-400/25'
                      } backdrop-blur-sm text-gray-800 placeholder-gray-500 font-bold text-lg tracking-widest text-center focus:outline-none focus:ring-2 transition-all duration-300 hover:shadow-md`}
                      placeholder="000000"
                      disabled={isOtpLoading || isResendLoading}
                      maxLength={6}
                    />
                    {errors.otp && <p className="mt-2 text-sm text-red-600">{errors.otp}</p>}
                  </div>

                  <button
                    onClick={handleVerifyOtp}
                    className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
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

                  <div className="text-center">
                    {isResendDisabled ? (
                      <div className="bg-gray-100 rounded-lg py-2 px-4 inline-flex items-center">
                        <span className="text-sm text-gray-600">
                          Resend code in <span className="font-semibold text-yellow-600">{resendTimer}s</span>
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={handleResendOtp}
                        className="text-yellow-600 hover:text-yellow-700 font-semibold text-sm flex items-center justify-center mx-auto transition-colors duration-200 bg-yellow-50 hover:bg-yellow-100 rounded-lg py-2 px-4"
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
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;