import React from 'react';
import { LayoutDashboard, Film, Ticket, Video,User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface SidebarProps {
  activePage: 'dashboard' | 'theaters' | 'shows' | 'bookings' | 'movies' | 'users';
}

const Sidebar: React.FC<SidebarProps> = ({ activePage }) => {
  const navigate = useNavigate();
  
  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, route: '/admin/dashboard', id: 'dashboard' },
    { name: 'Theaters', icon: <Film className="w-5 h-5" />, route: '/admin/theater', id: 'theaters' },
    { name: 'Shows', icon: <Video className="w-5 h-5" />, route: '/admin/shows', id: 'shows' },
    { name: 'Bookings', icon: <Ticket className="w-5 h-5" />, route: '/admin/bookings', id: 'bookings' },
    { name: 'Movies', icon: <Film className="w-5 h-5" />, route: '/admin/movies', id: 'movies' },
    { name: 'users', icon: <User className="w-5 h-5" />, route: '/admin/users', id: 'users' },
  ];

  // Sidebar animation variants
  const sidebarVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.3,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.div 
      className="flex flex-col w-64 min-h-screen bg-gray-900 border-r border-gray-800 shadow-xl"
      initial="hidden"
      animate="visible"
      variants={sidebarVariants}
    >
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-800">
        <motion.h2 
          className="text-xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          CenifyAdmin
        </motion.h2>
      </div>

      <div className="flex flex-col flex-1 py-6">
        <nav className="flex-1 space-y-2 px-3">
          {menuItems.map((item) => (
            <motion.button
              key={item.name}
              onClick={() => navigate(item.route)}
              className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                activePage === item.id
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-900/20'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
              variants={itemVariants}
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              {item.icon}
              <span className="ml-3">{item.name}</span>
            </motion.button>
          ))}
        </nav>

        <div className="px-3 mt-auto">
          <motion.button
            className="flex items-center w-full px-4 py-3 mt-6 text-sm font-medium text-red-400 rounded-lg transition-all duration-200 hover:bg-red-900/20 hover:text-red-300"
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <LogOut className="w-5 h-5" />  
            <span className="ml-3">Logout</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;