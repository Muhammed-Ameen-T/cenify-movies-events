import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
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
} from 'lucide-react';

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
          `flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
            isActive && !hasSubmenu
              ? 'bg-[#0066F5]/20 text-[#3391f7]'
              : 'text-gray-400 hover:text-white hover:bg-[#333333]'
          } ${isCollapsed ? 'justify-center' : 'justify-between'}`
        }
      >
        <div className="flex items-center">
          <span className={`${isCollapsed ? 'text-xl' : 'text-lg mr-3'}`}>{icon}</span>
          {!isCollapsed && <span>{label}</span>}
        </div>
        {hasSubmenu && !isCollapsed && (
          <span className="text-sm">
            {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </span>
        )}
      </NavLink>

      {hasSubmenu && !isCollapsed && (
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden ml-8 mt-1"
            >
              {submenuItems?.map((item, index) => (
                <NavLink
                  key={index}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center text-sm pl-3 pr-2 py-2 rounded-lg my-1 transition-all ${
                      isActive
                        ? 'bg-[#0066F5]/10 text-[#3391f7]'
                        : 'text-gray-400 hover:text-white hover:bg-[#121218]'
                    }`
                  }
                >
                  <span className="text-xs mr-2">•</span>
                  {item.label}
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
  return (
    <div
      className={`h-screen bg-[#121218] border-r border-[#333333] flex flex-col fixed top-0 left-0 z-50 transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-16'
      }`}
    >
      <div
        className={`flex items-center h-16 px-4 border-b border-[#333333] ${
          isOpen ? 'justify-between' : 'justify-center'
        }`}
      >
        {isOpen && (
          <div className="flex items-center">
            <Theater className="text-[#0066F5]" size={24} />
            <span className="ml-2 font-bold text-white">Vendor Dashboard</span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="text-gray-400 hover:text-white transition"
        >
          <Menu size={20} />
        </button>
      </div>

      <div className="flex-1 py-5 px-3 overflow-y-auto">
        <div className="mb-6">
          {!isOpen && <div className="text-xs text-center text-gray-500 mb-2">Menu</div>}
          {isOpen && (
            <div className="text-xs text-gray-500 uppercase tracking-wider px-3 mb-2">
              Main Menu
            </div>
          )}

          <NavItem
            path="/vendor/dashboard"
            label="Dashboard"
            icon={<LayoutDashboard size={20} />}
            isCollapsed={!isOpen}
          />

          <NavItem
            path="/events"
            label="Events"
            icon={<CalendarDays size={20} />}
            isCollapsed={!isOpen}
            hasSubmenu
            submenuItems={[
              { path: '/vendor/events', label: 'All Events' },
              { path: '/vendor/create-event', label: 'Create Event' },
              { path: '/vendor/event-categories', label: 'Categories' },
            ]}
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
              { path: '/vendor/maintenance', label: 'Maintenance' },
            ]}
          />

          <NavItem
            path="/shows"
            label="Shows"
            icon={<Film size={20} />}
            isCollapsed={!isOpen}
            hasSubmenu
            submenuItems={[
              { path: '/shows', label: 'All Shows' },
              { path: '/shows/create', label: 'Create Show' },
              { path: '/shows/schedule', label: 'Schedule' },
            ]}
          />

          <NavItem
            path="/dashboard/analytics"
            label="Analytics"
            icon={<BarChart3 size={20} />}
            isCollapsed={!isOpen}
          />

          <NavItem
            path="/customers"
            label="Customers"
            icon={<Users size={20} />}
            isCollapsed={!isOpen}
          />

          <NavItem
            path="/finance"
            label="Finance"
            icon={<DollarSign size={20} />}
            isCollapsed={!isOpen}
          />
        </div>

        {isOpen && (
          <div className="text-xs text-gray-500 uppercase tracking-wider px-3 mb-2">
            Settings
          </div>
        )}
        {!isOpen && <div className="text-xs text-center text-gray-500 mb-2">Other</div>}

        <NavItem
          path="/settings"
          label="Settings"
          icon={<Settings size={20} />}
          isCollapsed={!isOpen}
        />

        <NavItem
          path="/logout"
          label="Logout"
          icon={<LogOut size={20} />}
          isCollapsed={!isOpen}
        />
      </div>

      {/* {isOpen && (
        <div className="p-4 border-t border-[#333333] flex items-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0066F5] to-[#003d93] flex items-center justify-center text-white font-medium">
            TA
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-white">{user ? user.name : 'Theater Admin'}</div>
            <div className="text-xs text-gray-400">admin@theaterx.com</div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default Sidebar;