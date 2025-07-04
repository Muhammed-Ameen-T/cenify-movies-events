// src/components/Admin/Navbar.tsx
import React, { useState } from 'react';
import { Search, Bell, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { clearAuth } from '../../store/slices/authSlice';
import { showSuccessToast } from '../../utils/toast';
import { useNavigate } from 'react-router-dom';
import api from '../../config/axios.config';
import Avatar from '../ui/Avatar';

interface NavbarProps {
  title?: string;
  onMobileMenuToggle: () => void;
  isMobileMenuOpen: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ title, onMobileMenuToggle, isMobileMenuOpen }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const newUser = useSelector((state: RootState) => state.auth.user);
  const user = newUser?.role === 'admin' ? newUser : null;

  const onLogout = async () => {
    try {
      await api.post(`/auth/logout`);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      dispatch(clearAuth());
      navigate('/admin/login');
      showSuccessToast('Logout successful!');
    } catch (error) {
      showSuccessToast('Logout failed. Please try again.');
    }
  };

  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-gray-900 border-b border-gray-800 shadow-md sticky top-0 z-50">
      <div className="flex items-center">
        <motion.button
          className="text-gray-400 focus:outline-none lg:hidden"
          whileTap={{ scale: 0.9 }}
          onClick={onMobileMenuToggle}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </motion.button>

        {title && (
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="ml-4 text-xl font-bold text-white"
          >
            {title} Management
          </motion.h1>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <motion.button
          onClick={onLogout}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="px-3 py-1.5 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 transition duration-300"
          aria-label="Logout"
        >
          Logout
        </motion.button>
        <motion.div className="relative">
          <motion.button
            className="relative p-2 text-gray-400 bg-gray-800 rounded-full hover:text-white hover:bg-gray-700 focus:outline-none"
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/admin/notifications')}
            aria-label="Toggle notifications"
          >
            <Bell className="w-5 h-5" />
            {/* <span className="absolute top-0 right-0 flex items-center justify-center w-4 h-4 text-xs text-white bg-red-500 rounded-full">
              6
            </span> */}
          </motion.button>
          
        </motion.div>

        <motion.div
          className="relative flex items-center space-x-3"
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        >
          <Avatar
            src={user ? user.profileImage : 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'}
            name={user ? user.name : 'Vendor'}
            size="sm"
            className="border-2 border-[#0066F5]/30 shadow-lg"
          />
          <div className="hidden md:block text-left">
            <h2 className="text-sm font-semibold text-white">{user?.name || 'Admin'}</h2>
            <p className="text-xs text-gray-400">Admin</p>
          </div>
        </motion.div>
      </div>
    </nav>
  );
};

export default Navbar;