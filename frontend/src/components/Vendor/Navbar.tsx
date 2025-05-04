import React, { useState } from 'react';
import { Bell, Search, Moon, Sun, MessageSquare } from 'lucide-react';
import Avatar from '../ui/Avatar';
import { currentUser } from '../../utils/mockData';

interface NavbarProps {
  sidebarOpen: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ sidebarOpen }) => {
  const [searchFocused, setSearchFocused] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifications = [
    {
      id: 1,
      title: 'New Booking',
      message: '3 new bookings for "The Phantom of the Opera"',
      time: '10 min ago',
      unread: true,
    },
    {
      id: 2,
      title: 'Show Update',
      message: 'Schedule updated for "Hamlet"',
      time: '1 hour ago',
      unread: true,
    },
    {
      id: 3,
      title: 'System Notification',
      message: 'Theater maintenance scheduled for next week',
      time: '2 hours ago',
      unread: false,
    },
  ];

  console.log('Rendering Navbar, sidebarOpen:', sidebarOpen);

  return (
    <div
      className="fixed top-0 right-0 z-40 bg-[#18181f] border-b border-[#333333] h-16"
      style={{
        width: sidebarOpen ? 'calc(100% - 256px)' : 'calc(100% - 64px)',
        marginLeft: sidebarOpen ? '256px' : '64px',
      }}
    >
      <div className="px-6 h-full flex items-center justify-between">
        <div className="flex-1 max-w-xl">
          <div
            className={`rounded-lg bg-[#121218] flex items-center px-3 py-2 border transition-all duration-200 ${
              searchFocused
                ? 'border-[#0066F5] shadow-sm shadow-[#0066F5]/20'
                : 'border-[#333333]'
            }`}
          >
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search for theaters, shows, events..."
              className="bg-transparent border-none outline-none text-white text-sm w-full px-3"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#333333] transition-colors"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#333333] transition-colors">
            <MessageSquare size={18} />
          </button>

          <div className="relative">
            <button
              className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#333333] transition-colors"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#f5005f]"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-[#18181f] border border-[#333333] rounded-lg shadow-lg overflow-hidden z-50">
                <div className="p-3 border-b border-[#333333] flex justify-between items-center">
                  <h3 className="font-medium text-white">Notifications</h3>
                  <button className="text-xs text-[#0066F5] hover:text-[#3391f7]">
                    Mark all as read
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 border-b border-[#333333] hover:bg-[#121218] transition-colors flex items-start ${
                        notification.unread ? 'bg-[#121218]/50' : ''
                      }`}
                    >
                      {notification.unread && (
                        <div className="w-2 h-2 rounded-full bg-[#0066F5] mt-2 mr-2"></div>
                      )}
                      <div className="flex-1 pl-1">
                        <h4 className="text-sm font-medium text-white">{notification.title}</h4>
                        <p className="text-xs text-gray-400 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-2 text-center">
                  <button className="text-sm text-[#0066F5] hover:text-[#3391f7]">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              className="flex items-center"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <Avatar src={currentUser.avatar} name={currentUser.name} size="sm" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-60 bg-[#18181f] border border-[#333333] rounded-lg shadow-lg overflow-hidden z-50">
                <div className="p-4 border-b border-[#333333]">
                  <h3 className="font-medium text-white">{currentUser.name}</h3>
                  <p className="text-xs text-gray-400 mt-1">{currentUser.email}</p>
                </div>
                <div>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#121218] transition-colors">
                    Profile
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#121218] transition-colors">
                    Settings
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#121218] transition-colors">
                    Help Center
                  </button>
                  <div className="border-t border-[#333333] mt-1 pt-1">
                    <button className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#121218] transition-colors">
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;