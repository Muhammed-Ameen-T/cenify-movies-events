import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  ChevronDown,
  User,
  Ticket,
  Wallet,
  HelpCircle,
  LogOut,
  MapPin,
  Bell,
  HomeIcon,
  Film,
  LogIn,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/cenify-logo.png';
import { RootState } from '../../store/store';
import { setSelectedLocation } from '../../store/slices/locationSlice';
import { clearAuth } from '../../store/slices/authSlice';
import { showSuccessToast } from '../../utils/toast';
import NotificationDropdown from '../userNav/NotificationModak';
import CitySelectionModal from '../userNav/CitySelectionModal';
import SearchModal from '../userNav/SearchModal';
import api from '../../config/axios.config';
import LoginModal from './LoginModal';

interface Notification {
  id: number;
  message: string;
  date: string;
  read: boolean;
}

const Navbar: React.FC = () => {
  const newUser = useSelector((state: RootState) => state.auth.user);
  const user = newUser?.role === 'user' ? newUser : null;
  const selectedLocation = useSelector((state: RootState) => state.location.selectedLocation);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const cityModalRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsNotificationOpen(false);
      }
      if (
        cityModalRef.current &&
        !cityModalRef.current.contains(event.target as Node)
      ) {
        setIsCityModalOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    api.post(`/auth/logout`);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    dispatch(clearAuth());
    setIsProfileMenuOpen(false);
    navigate('/');
    showSuccessToast('User Logout successfully!');
  };

  const menuItems = [
    { label: 'Home', action: () => navigate('/'), icon: <HomeIcon size={18} /> },
    user && {
      label: 'Account',
      action: () => navigate('/account/account-tab'),
      icon: <User size={18} />,
    },
    user && {
      label: 'Bookings',
      action: () => navigate('/account/bookings-tab'),
      icon: <Ticket size={18} />,
    },
    user && {
      label: 'Wallet',
      action: () => navigate('/account/wallet-tab'),
      icon: <Wallet size={18} />,
    },
    user && {
      label: 'Movie Pass',
      action: () => navigate('/account/moviepass-tab'),
      icon: <Film size={18} />,
    },
    user && {
      label: 'Notification',
      action: () => navigate('/account/notifications-tab'),
      icon: <Bell size={18} />,
    },
    { label: 'Help & Feedback', action: () => navigate('/help'), icon: <HelpCircle size={18} /> },
  ].filter(Boolean);

  if (user) {
    menuItems.push({
      label: 'Logout',
      action: handleLogout,
      icon: <LogOut size={18} />,
    });
  }

  const handleClick = () => {
    navigate('/account/notifications-tab');
  };

  const toHome = () => {
    navigate('/');
    setIsProfileMenuOpen(false);
  };

  const handleSearchClick = () => {
    setIsSearchModalOpen(true);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full h-16 backdrop-blur-xs bg-transparent bg-clip-padding shadow-xs z-50">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-2xl transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
        </div>

        <div className="relative z-10 h-full flex items-center justify-between px-4 md:px-8 max-w-7xl mx-auto">
          {/* Logo Section */}
          <div
            className="flex items-center cursor-pointer group transition-transform duration-300 hover:scale-105"
            onClick={toHome}
          >
            <div className="relative">
              <img src={logo} alt="Cenify" className="h-12.5 w-auto object-contain" />
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-lg blur-lg opacity-0 transition-opacity duration-300"></div>
            </div>
          </div>

          {/* Enhanced Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-6">
            <div className={`relative w-full transition-all duration-300 ${isSearchFocused ? 'scale-105' : ''}`}>
              <div className="relative">
                <div
                  onClick={handleSearchClick}
                  className={`w-full px-4 py-2 rounded-lg border-2 transition-all duration-300 bg-white/80 backdrop-blur-sm text-gray-800 placeholder-gray-500 font-medium shadow-md text-sm cursor-pointer flex items-center ${
                    isSearchFocused
                      ? 'border-yellow-400 bg-white shadow-lg shadow-yellow-400/25 ring-4 ring-yellow-400/10'
                      : 'border-gray-200 hover:border-yellow-300 hover:shadow-lg'
                  }`}
                  onMouseEnter={() => setIsSearchFocused(true)}
                  onMouseLeave={() => setIsSearchFocused(false)}
                >
                  <span className="text-gray-500">Search for Movies ...</span>
                </div>
                <div
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-all duration-300 pointer-events-none ${
                    isSearchFocused ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gray-100'
                  } p-1.5 rounded-lg`}
                >
                  <Search className={`${isSearchFocused ? 'text-white' : 'text-gray-500'}`} size={18} />
                </div>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Mobile Search Icon */}
            <button
              onClick={handleSearchClick}
              className="md:hidden p-2 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 hover:border-yellow-300 hover:bg-white transition-all duration-300 hover:shadow-md hover:scale-105"
            >
              <Search className="text-gray-600 hover:text-yellow-600" size={16} />
            </button>

            {/* Mobile Location Selector */}
            <button
              onClick={() => setIsCityModalOpen(true)}
              className="md:hidden p-2 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 hover:border-yellow-300 hover:bg-white transition-all duration-300 hover:shadow-md hover:scale-105"
            >
              <MapPin className="text-gray-600 hover:text-yellow-600" size={16} />
            </button>

            {/* Mobile Login Button / User Name */}
            {!user && (
              <button
                onClick={() => setShowLoginModal(true)}
                className="md:hidden bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white px-2 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-md hover:shadow-yellow-400/25 border border-yellow-300 text-xs font-medium"
              >
                <LogIn size={16} />
              </button>
            )}

            {/* City Selector - Desktop */}
            <div
              className="hidden md:flex items-center cursor-pointer group bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-200 hover:border-yellow-300 hover:bg-white transition-all duration-300 hover:shadow-md"
              onClick={() => setIsCityModalOpen(true)}
            >
              <MapPin className="text-gray-600 group-hover:text-yellow-600 mr-1.5 transition-colors" size={16} />
              <span className="text-gray-700 group-hover:text-gray-900 font-medium text-sm transition-colors">
                {selectedLocation || 'Select a location'}
              </span>
              <ChevronDown className="text-gray-600 group-hover:text-yellow-600 ml-1.5 transition-colors" size={14} />
            </div>

            {/* Enhanced Notification Bell */}
            <div className="relative" ref={notificationRef}>
              {user && (
                <button
                  onClick={handleClick}
                  className="relative p-2 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 hover:border-yellow-300 hover:bg-white transition-all duration-300 hover:shadow-md hover:scale-105"
                >
                  <Bell className="text-gray-600 group-hover:text-yellow-600 transition-colors" size={18} />
                </button>
              )}

              <NotificationDropdown
                notifications={notifications}
                notificationCount={notificationCount}
                isNotificationOpen={isNotificationOpen}
                setIsNotificationOpen={setIsNotificationOpen}
                setNotifications={setNotifications}
                setNotificationCount={setNotificationCount}
                notificationRef={notificationRef}
              />
            </div>

            {/* Desktop Login Button / User Name */}
            {user ? (
              <div className="hidden md:flex items-center bg-gradient-to-r from-yellow-100 to-orange-100 px-3 py-1.5 rounded-lg border border-yellow-200">
                <span className="font-bold text-gray-800 text-sm">Welcome, {user.name.split(' ')[0]}</span>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="hidden md:block bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 font-bold text-white px-4 py-1.5 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-md hover:shadow-yellow-400/25 border border-yellow-300"
              >
                Sign In
              </button>
            )}

            {/* Enhanced Profile Menu */}
            <div className="relative flex items-center" ref={menuRef}>
              <div className="flex items-center space-x-1.5">
                <div className="relative group">
                  <img
                    src={user?.profileImage ? user.profileImage : import.meta.env.VITE_DEFAULT_PROFILE_IMAGE}
                    onError={(e) => {
                      e.currentTarget.src = import.meta.env.VITE_DEFAULT_PROFILE_IMAGE;
                    }}
                    alt="Profile"
                    className="w-10 h-10 rounded-full border-2 border-gradient-to-r from-yellow-400 to-orange-500 cursor-pointer transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full opacity-0 transition-opacity duration-300"></div>
                </div>

                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="p-1.5 bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronDown
                    className={`text-gray-600 transition-transform duration-300 ${isProfileMenuOpen ? 'rotate-180' : ''}`}
                    size={18}
                  />
                </button>
              </div>

              {/* Enhanced Dropdown Menu */}
              <AnimatePresence>
                {isProfileMenuOpen && (
                  <motion.div
                    className="absolute top-14 right-0 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-100 py-2 z-50 overflow-hidden"
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                  >
                    {/* Header */}
                    <div className="px-5 py-3 border border-gray-100 bg-gradient-to-r from-yellow-50 to-orange-50">
                      <div className="flex items-center space-x-2">
                        <img
                          src={user?.profileImage ? user.profileImage : import.meta.env.VITE_DEFAULT_PROFILE_IMAGE}
                          alt="Profile"
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-bold text-gray-800 text-sm">
                            {user?.name || 'Guest User'}
                          </p>
                          <p className="text-xs text-gray-600">
                            {user?.email || 'Not signed in'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      {menuItems.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            item.action();
                            setIsProfileMenuOpen(false);
                          }}
                          className={`w-full text-left px-5 py-2.5 flex items-center space-x-2 transition-all duration-200 group ${
                            item.label === 'Logout'
                              ? 'text-red-600 hover:bg-red-50 hover:text-red-700'
                              : 'text-gray-700 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 hover:text-gray-900'
                          }`}
                        >
                          <div
                            className={`p-1 rounded-lg transition-colors`}
                          >
                            {item.icon}
                          </div>
                          <span className="font-medium text-sm">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </nav>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />

      <CitySelectionModal
        isCityModalOpen={isCityModalOpen}
        setIsCityModalOpen={setIsCityModalOpen}
        selectedLocation={selectedLocation}
        setSelectedLocation={(location: string) => dispatch(setSelectedLocation(location))}
        cityModalRef={cityModalRef}
      />
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  );
};

export default Navbar;