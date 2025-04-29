import { useState, useRef } from 'react';
import { Mail, Lock, Eye, EyeOff, Shield, ArrowRight } from 'lucide-react';
import { login } from '../../services/Admin/authApi';
import { useDispatch } from 'react-redux';
import { setAuth } from '../../store/slices/authSlice';
import { startLoading, stopLoading } from '../../store/slices/loadingSlice';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 100,
    },
  },
};

const inputVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
};

const buttonVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { delay: 0.5, duration: 0.3, ease: 'easeInOut' } },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
};

export default function AdminLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { email: '', password: '' };

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      valid = false;
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    dispatch(startLoading());

    try {
      const response = await login(formData.email, formData.password);

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
      navigate('/admin/dashboard');
    } catch (error) {
      setErrors({
        email: '',
        password: error instanceof Error ? error.message : 'Login failed. Please check your credentials.',
      });
    } finally {
      setIsSubmitting(false);
      dispatch(stopLoading());
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
    if (passwordRef.current) {
      passwordRef.current.focus();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 px-4">
      <motion.div
        className="w-full max-w-md"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="bg-gradient-to-r from-blue-800 to-indigo-900 rounded-t-xl p-6 text-center">
          <div className="flex justify-center">
            <div className="bg-gray-800 p-3 rounded-full">
              <Shield className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mt-3">Admin Portal</h2>
          <p className="text-blue-200 mt-1">Secure access to management console</p>
        </motion.div>

        <motion.div className="bg-gray-800 rounded-b-xl shadow-2xl p-8 border-t border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div className="space-y-1" variants={inputVariants} initial="initial" animate="animate">
              <label htmlFor="email" className="text-sm font-medium text-gray-300">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 text-gray-100 bg-gray-700 rounded-lg border ${
                    errors.email ? 'border-red-500' : 'border-gray-600'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="admin@example.com"
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="text-sm text-red-400 mt-1">{errors.email}</p>}
            </motion.div>

            <motion.div className="space-y-1" variants={inputVariants} initial="initial" animate="animate">
              <label htmlFor="password" className="text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  ref={passwordRef}
                  className={`block w-full pl-10 pr-12 py-3 text-gray-100 bg-gray-700 rounded-lg border ${
                    errors.password ? 'border-red-500' : 'border-gray-600'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                  )}
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-400 mt-1">{errors.password}</p>}
            </motion.div>

            <div className="flex items-center justify-between">
              <div className="flex items-center"></div>
              <div className="text-sm">
                <a href="#" className="font-medium text-blue-400 hover:text-blue-300">
                  Forgot password?
                </a>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isSubmitting}
              variants={buttonVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
              whileTap="tap"
              className={`flex items-center justify-center w-full px-4 py-3 text-white font-medium rounded-lg transition-colors duration-150 ${
                isSubmitting ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Logging in...
                </div>
              ) : (
                <>
                  Sign in <ArrowRight className="ml-2" />
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            © 2025 Admin Portal • All access is monitored and logged
          </p>
        </div>
      </motion.div>
    </div>
  );
}