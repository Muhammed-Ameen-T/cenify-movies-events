import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { RootState } from '../../store/store';
import { REDIRECT_MESSAGES } from '../../constants/redirect.messges';


// Define props interface
interface PageNotFoundProps {
  title?: string;
  message?: string;
  linkText?: string;
  linkTo?: string;
}

// Define user role type
type UserRole = 'user' | 'admin' | 'vendor' | null;

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.2,
      ease: 'easeOut',
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, rotate: 5 },
  visible: {
    opacity: 1,
    y: 0,
    rotate: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};
  
const buttonVariants = {
  hover: { scale: 1.05, backgroundColor: '#D97706', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)' },
  tap: { scale: 0.95 },
};

const PageNotFound: React.FC<PageNotFoundProps> = ({
  title = REDIRECT_MESSAGES.PAGE_NOT_FOUND_TITLE,
  message = REDIRECT_MESSAGES.PAGE_NOT_FOUND_MESSAGE,
  linkText = REDIRECT_MESSAGES.HOME,
  linkTo = '/',
}) => {
  const navigate = useNavigate();
  // Access user from Redux store
  const user = useSelector((state: RootState) => state.auth.user);
  const userRole: UserRole = user?.role || null;

  // Determine redirect path based on user role
  const getRedirectPath = () => {
    switch (userRole) {
      case 'admin':
        return '/admin/dashboard';
      case 'vendor':
        return '/vendor/dashboard';
      case 'user':
      default:
        return linkTo; // Fallback to prop-provided linkTo
    }
  };

  const handleRedirect = () => {
    const redirectPath = getRedirectPath();
    navigate(redirectPath);
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-gradient-to-br from-white to-yellow-50 relative overflow-hidden">
      {/* Subtle background circle for visual interest */}
      <div className="absolute top-0 left-0 w-full h-full bg-yellow-200 opacity-10 rounded-full transform scale-150 -translate-x-1/2 -translate-y-1/2"></div>
      <motion.div
        className="text-center px-6 max-w-lg bg-white rounded-2xl shadow-xl p-10 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="text-6xl font-extrabold text-yellow-600 tracking-tight mb-6"
          variants={itemVariants}
        >
          {title}
        </motion.h1>
        <motion.p
          className="text-xl text-gray-700 mb-10 leading-relaxed font-medium"
          variants={itemVariants}
        >
          {message}
        </motion.p>
        <motion.button
          type="button"
          className="px-8 py-4 text-lg font-semibold rounded-lg bg-yellow-500 text-white shadow-lg hover:bg-yellow-600 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-yellow-300 focus:ring-offset-2"
          onClick={handleRedirect}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          {linkText}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default PageNotFound;