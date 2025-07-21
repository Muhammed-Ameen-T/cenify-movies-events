import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  CalendarDays,
  Theater,
  Film,
  BarChart3,
  Settings,
  Users,
  DollarSign,
  Menu,
  ChevronDown,
  ChevronRight,
  LogOut,
  Monitor,
  Layout,
  BoxIcon,
  Ticket,
  X,
  Wallet
} from 'lucide-react';
import { RootState } from '../../store/store';
import { useDispatch, useSelector } from 'react-redux';
import Avatar from '../ui/Avatar';
import api from '../../config/axios.config';
import { clearAuth } from '../../store/slices/authSlice';
import { showSuccessToast } from '../../utils/toast';
import { Bell } from 'react-feather';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

interface NavItemProps {
  path: string;
  label: string;
  icon: React.ReactNode;
  isCollapsed: boolean;
  hasSubmenu?: boolean;
  submenuItems?: { path: string; label: string }[];
}

const NavItem: React.FC<NavItemProps> = ({
  path,
  label,
  icon,
  isCollapsed,
  hasSubmenu,
  submenuItems,
}) => {
  const [isOpen, setIsOpen] = useState(false);
 
  const toggleSubmenu = (e: React.MouseEvent) => {
    if (hasSubmenu) {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };
 
  return (
    <div className="mb-1">
      <NavLink
        to={hasSubmenu ? '#' : path}
        onClick={toggleSubmenu}
        className={({ isActive }) =>
          `group flex items-center px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden ${
            isActive && !hasSubmenu
              ? 'bg-gradient-to-r from-[#0066F5]/20 to-[#0066F5]/10 text-[#3391f7] shadow-lg shadow-[#0066F5]/20'
              : 'text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-[#2A2A3A] hover:to-[#252536]'
          } ${isCollapsed ? 'justify-center' : 'justify-between'}`
        }
      >
        {/* Active indicator */}
        <div className={`absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-[#0066F5] to-[#3391f7] transition-transform duration-300 ${
          !hasSubmenu ? 'scale-y-100' : 'scale-y-0'
        }`} />
        
        <div className="flex items-center z-10">
          <div className={`flex items-center justify-center transition-all duration-300 ${
            isCollapsed ? 'w-6 h-6' : 'w-5 h-5 mr-3'
          }`}>
            {icon}
          </div>
          {!isCollapsed && (
            <span className="font-medium text-sm tracking-wide">{label}</span>
          )}
        </div>
        
        {hasSubmenu && !isCollapsed && (
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center w-4 h-4"
          >
            <ChevronDown size={14} />
          </motion.div>
        )}
      </NavLink>
      
      {hasSubmenu && !isCollapsed && (
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden ml-6 mt-2 space-y-1"
            >
              {submenuItems?.map((item, index) => (
                <NavLink
                  key={index}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center text-sm pl-6 pr-4 py-2.5 rounded-lg transition-all duration-200 relative group ${
                      isActive
                        ? 'bg-gradient-to-r from-[#0066F5]/15 to-[#0066F5]/5 text-[#3391f7] border-l-2 border-[#0066F5]'
                        : 'text-gray-500 hover:text-gray-300 hover:bg-[#1E1E2A] hover:border-l-2 hover:border-gray-600'
                    }`
                  }
                >
                  <div className="w-2 h-2 rounded-full bg-current opacity-60 mr-3 transition-all duration-200 group-hover:opacity-100" />
                  <span className="font-medium tracking-wide">{item.label}</span>
                </NavLink>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  console.log('Rendering Sidebar, isOpen:', isOpen);
  const newUser = useSelector((state: RootState) => state.auth.user);
  const user = newUser?.role === 'vendor' ? newUser : null;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    api.post('/auth/logout');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    dispatch(clearAuth());
    showSuccessToast('Vendor Logout successfully!');
    navigate('/vendor/login');
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      <motion.div
        initial={false}
        animate={{ 
          width: isOpen ? 280 : 72,
          x: 0 
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`h-screen bg-gradient-to-b from-[#0F0F17] via-[#121218] to-[#0F0F17] border-r border-[#2A2A3A]/50 flex flex-col fixed top-0 left-0 z-50 shadow-2xl`}
      >
        {/* Header */}
        <div className="flex items-center h-20 px-6 border-b border-[#2A2A3A]/30 bg-gradient-to-r from-[#121218] to-[#1A1A26]">
          {isOpen ? (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex items-center space-x-3"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#0066F5] to-[#003d93] shadow-lg">
                <Theater className="text-white" size={20} />
              </div>
              <div>
                <h1 className="font-bold text-white text-lg tracking-wide">Cenify Vendor</h1>
                <p className="text-xs text-gray-400 font-medium">Management Portal</p>
              </div>
            </motion.div>
          ) : (
            <></>
          )}
          
          <button
            onClick={toggleSidebar}
            className="ml-auto p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#2A2A3A]/50 transition-all duration-200"
          >
            {isOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-6 px-4 overflow-y-auto custom-scrollbar">
          <div className="space-y-8">
            {/* Main Menu Section */}
            <div>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="flex items-center px-4 mb-4"
                  >
                  <div className="h-px bg-gradient-to-r from-transparent via-[#2A2A3A] to-transparent flex-1" />
                  <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold px-3">
                    Main Menu
                  </span>
                  <div className="h-px bg-gradient-to-r from-transparent via-[#2A2A3A] to-transparent flex-1" />
                </motion.div>
              )}
              
              <div className="space-y-1">
                <NavItem
                  path="/vendor/dashboard"
                  label="Dashboard"
                  icon={<LayoutDashboard size={20} />}
                  isCollapsed={!isOpen}
                />
                
                <NavItem
                  path="/vendor/bookings"
                  label="Bookings"
                  icon={<Ticket size={20} />}
                  isCollapsed={!isOpen}
                />

                <NavItem
                  path="/vendor/notifications"
                  label="Notifications"
                  icon={<Bell size={20} />}
                  isCollapsed={!isOpen}
                />

                <NavItem
                  path="/vendor/wallet"
                  label="Wallet"
                  icon={<Wallet size={20} />}
                  isCollapsed={!isOpen}
                />

                <NavItem
                  path="/vendor/theaters"
                  label="Theaters"
                  icon={<Theater size={20} />}
                  isCollapsed={!isOpen}
                  hasSubmenu
                  submenuItems={[
                    { path: '/vendor/theaters', label: 'All Theaters' },
                    { path: '/vendor/create-theater', label: 'Add Theater' },
                  ]}
                />
                
                <NavItem
                  path="/vendor/screens"
                  label="Screens"
                  icon={<Monitor size={20} />}
                  isCollapsed={!isOpen}
                  hasSubmenu
                  submenuItems={[
                    { path: '/vendor/screens', label: 'All Screens' },
                    { path: '/vendor/create-screens', label: 'Add Screen' },
                  ]}
                />
                
                <NavItem
                  path="/vendor/seats"
                  label="Seat Layouts"
                  icon={<Layout size={20} />}
                  isCollapsed={!isOpen}
                  hasSubmenu
                  submenuItems={[
                    { path: '/vendor/seats', label: 'All Seat Layouts' },
                    { path: '/vendor/create-seats', label: 'Add Seat Layouts' },
                  ]}
                />
                
                <NavItem
                  path="/vendor/shows"
                  label="Shows"
                  icon={<Film size={20} />}
                  isCollapsed={!isOpen}
                  hasSubmenu
                  submenuItems={[
                    { path: '/vendor/shows', label: 'All Shows' },
                    { path: '/vendor/create-show', label: 'Create Show' },
                  ]}
                />
                
              </div>
            </div>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="p-4 border-t border-[#2A2A3A]/30 bg-gradient-to-r from-[#121218] to-[#1A1A26]">
          <div className="relative">
            <button
              className={`flex items-center w-full p-3 rounded-xl transition-all duration-200 hover:bg-[#2A2A3A]/30 ${
                isOpen ? 'space-x-3' : 'justify-center'
              }`}
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="relative">
                <Avatar
                  src={user ? user.profileImage : 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'}
                  name={user ? user.name : 'Vendor'}
                  size="md"
                  className="border-2 border-[#0066F5]/30 shadow-lg"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[#121218] rounded-full" />
              </div>
              
              {isOpen && (
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-white text-sm truncate">
                    {user?.name || 'Vendor'}
                  </h3>
                  <p className="text-xs text-gray-400 truncate">
                    {user?.email || 'vendor@example.com'}
                  </p>
                </div>
              )}
              
              {isOpen && (
                <ChevronDown 
                  size={16} 
                  className={`text-gray-400 transition-transform duration-200 ${
                    showUserMenu ? 'rotate-180' : ''
                  }`} 
                />
              )}
            </button>
            
            <AnimatePresence>
              {showUserMenu && isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-full left-0 right-0 mb-2 bg-[#1A1A26] border border-[#2A2A3A] rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl"
                >
                  <div className="p-4 border-b border-[#2A2A3A]/50 bg-gradient-to-r from-[#1A1A26] to-[#1F1F2E]">
                    <h3 className="font-semibold text-white text-sm">
                      {user?.name || 'Vendor'}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      {user?.email || 'vendor@example.com'}
                    </p>
                  </div>
                  
                  {user && (
                    <div className="p-2">
                      <button 
                        onClick={handleLogout} 
                        className="w-full flex items-center px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200 group"
                      >
                        <LogOut size={16} className="mr-3 group-hover:animate-pulse" />
                        <span className="font-medium">Logout</span>
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #2A2A3A;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3A3A4A;
        }
      `}</style>
    </>
  );
};

export default Sidebar;