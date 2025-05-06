import React, { useState } from 'react';
import { Search, Bell, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

import LogoutButton from '../Buttons/LogoutButton';
interface NavbarProps {
  title?: string;
}

const Navbar: React.FC<NavbarProps> = ({ title }) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const newUser = useSelector((state: RootState) => state.auth.user);
  const user = newUser?.role === 'admin' ? newUser : null;
  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-gray-900 border-b border-gray-800 shadow-md">
      <div className="flex items-center">
        <motion.button 
          className="text-gray-400 focus:outline-none lg:hidden"
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </motion.button>

        {title && (
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="hidden ml-4 text-xl font-bold text-white lg:block"
          >
            {title}
          </motion.h1>
        )}
      </div>

      <div className="flex-1 max-w-md ml-6">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="w-5 h-5 text-gray-400" />
          </span>
          <motion.input
            className="w-full py-2 pl-10 pr-4 text-white bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="text"
            placeholder="Search..."
            initial={{ width: '90%' }}
            whileFocus={{ width: '100%' }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <motion.button>
          <LogoutButton/>
        </motion.button>
        <motion.div className="relative">
          <motion.button 
            className="relative p-2 text-gray-400 bg-gray-800 rounded-full hover:text-white hover:bg-gray-700 focus:outline-none"
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 flex items-center justify-center w-4 h-4 text-xs text-white bg-red-500 rounded-full">
              6
            </span>
          </motion.button>


          <AnimatePresence>
            {isNotificationsOpen && (
              <motion.div 
                className="absolute right-0 z-10 w-80 mt-2 bg-gray-800 rounded-lg shadow-xl border border-gray-700"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="p-4 border-b border-gray-700">
                  <h3 className="text-sm font-semibold text-white">Notifications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {[1, 2, 3, 4, 5, 6].map((item) => (
                    <div key={item} className="p-4 border-b border-gray-700 hover:bg-gray-700">
                      <p className="text-sm text-white">New booking confirmed #{item}</p>
                      <p className="text-xs text-gray-400 mt-1">5 min ago</p>
                    </div>
                  ))}
                </div>
                <div className="p-3 text-center text-sm text-blue-400 border-t border-gray-700 hover:bg-gray-700 rounded-b-lg">
                  <button>View all notifications</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div 
          className="relative flex items-center space-x-3"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          {user?.profileImage ? (
            <img 
              className="object-cover w-9 h-9 rounded-full border-2 border-blue-500"
              src={user.profileImage}
              alt="User avatar"
            />
          ) : (
            <img 
              className="object-cover w-9 h-9 rounded-full border-2 border-blue-500"
              src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150"
              alt="Default avatar"
            />
          )}
          <div className="hidden md:block text-left">
            <h2 className="text-sm font-semibold text-white">{user?.name ? user?.name : 'Admin'}</h2>
            <p className="text-xs text-gray-400">Admin</p>
          </div>
        </motion.div>
      </div>  
    </nav>
  );
};

export default Navbar;