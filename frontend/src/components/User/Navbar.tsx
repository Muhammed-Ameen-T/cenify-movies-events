import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  ChevronDown,
  User,
  Ticket,
  Wallet,
  Star,
  HelpCircle,
  Bell,
  Gift,
  LogOut,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/cenify-logo.png';
import { RootState } from '../../store/store';
import axios from 'axios';
import { API_BASE_URL } from '../../constants/apiEndPoint';
import { clearAuth } from '../../store/slices/authSlice'; 
import { showSuccessToast, showErrorToast } from '../../utils/toast'; 

interface NavbarProps {
  onLoginClick: () => void;
  onMenuToggle: () => void;
  showMenu: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ onLoginClick, onMenuToggle, showMenu }) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle logout
  const handleLogout = () => {
    
    axios.post(`${API_BASE_URL}/auth/logout`);
    // Clear localStorage data
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');

    // Dispatch Redux action to reset authentication state
    dispatch(clearAuth());
    setIsProfileMenuOpen(false);
    showSuccessToast('User Logout successfully!')
  };

  // Menu items with icons
  const menuItems = [
    { label: 'Account', action: () => navigate('/account'), icon: <User size={16} /> },
    { label: 'Bookings', action: () => navigate('/bookings'), icon: <Ticket size={16} /> },
    { label: 'Wallet', action: () => navigate('/wallet'), icon: <Wallet size={16} /> },
    {
      label: 'Loyalty Points',
      action: () => navigate('/loyalty'),
      icon: <Star size={16} />,
    },
    {
      label: 'Help & Feedback',
      action: () => navigate('/help'),
      icon: <HelpCircle size={16} />,
    },
    {
      label: 'Notification',
      action: () => navigate('/notifications'),
      icon: <Bell size={16} />,
    },
    { label: 'Reward', action: () => navigate('/rewards'), icon: <Gift size={16} /> },
    { label: 'Logout', action: handleLogout, icon: <LogOut size={16} /> },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-lg z-50 h-16 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center">
        <img src={logo} alt="Cenify" className="h-10 w-auto object-contain" />
      </div>

      <div className="hidden md:flex flex-1 max-w-lg mx-4">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search for Movies, Events..."
            className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="hidden md:flex items-center cursor-pointer">
          <span className="text-gray-700 text-sm">Kozhikode</span>
          <ChevronDown className="text-gray-700 ml-1" size={16} />
        </div>

        {user ? (
          <span className="hidden md:block font-semibold text-black px-4 py-1 rounded-full text-sm">
            {user.name}
          </span>
        ) : (
          <button
            onClick={onLoginClick}
            className="hidden md:block bg-yellow-400 font-semibold text-black px-4 py-1 rounded-full hover:bg-yellow-500 transition text-sm"
          >
            Login
          </button>
        )}

        <div className="relative flex items-center space-x-1" ref={menuRef}>
          <div className="flex items-center space-x-1">
            <img
              src={
                user?.profileImage
                  ? user.profileImage
                  : 'data:image/png;base64,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'
              }
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover border-2 border-yellow-400 cursor-pointer"
            />
            <ChevronDown
              className="text-gray-700 cursor-pointer"
              size={20}
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            />
            <Menu className="text-gray-700 md:hidden" size={24} onClick={onMenuToggle} />
          </div>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {isProfileMenuOpen && (
              <motion.div
                className="absolute top-16 right-0 w-64 bg-white rounded-lg shadow-2xl border border-gray-200 py-2 z-50"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {menuItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      item.action();
                      setIsProfileMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 transition-colors ${
                      item.label === 'Logout'
                        ? 'text-gray-700 hover:bg-red-100 hover:text-red-600'
                        : 'text-gray-700 hover:bg-yellow-100 hover:text-yellow-600'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;