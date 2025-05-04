import React from 'react';
import { motion } from 'framer-motion';
import { User, Ticket, Wallet, Star, HelpCircle, Bell, Gift, X, LogOut } from 'lucide-react';

interface MobileMenuProps {
  onClose: () => void;
  onLoginClick: () => void;
  user: any | null;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ onClose, onLoginClick, user }) => {
  const menuVariants = {
    hidden: { 
      opacity: 0,
      x: '100%' 
    },
    visible: { 
      opacity: 1,
      x: 0,
      transition: { 
        type: 'spring',
        stiffness: 300,
        damping: 30
      } 
    },
    exit: { 
      opacity: 0,
      x: '100%',
      transition: { 
        ease: 'easeInOut',
        duration: 0.3
      } 
    }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  const menuItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { 
        delay: custom * 0.1,
        duration: 0.5
      }
    })
  };

  return (
    <motion.div 
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex md:hidden"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      onClick={onClose}
    >
      <motion.div 
        className="bg-white h-full w-3/4 ml-auto p-6 flex flex-col overflow-y-auto"
        variants={menuVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-gray-800">Menu</h2>
          <motion.div
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
          >
            <X className="cursor-pointer text-gray-700" size={24} />
          </motion.div>
        </div>
        
        <div className="flex flex-col space-y-4 text-gray-700">
          <motion.div
            custom={0}
            variants={menuItemVariants}
            initial="hidden"
            animate="visible"
            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors duration-300"
            onClick={() => {
              onLoginClick();
              onClose();
            }}
            whileHover={{ backgroundColor: "#F9FAFB" }}
          >
            <div className="flex items-center space-x-3">
              <User size={20} className="text-yellow-500" />
              <span className="font-medium">Account</span>
            </div>
            {user ? (
              <button className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            ) : (  
              <button className="bg-yellow-400 text-gray-800 px-3 py-1 rounded-full text-xs font-medium">Login</button>
            )}
          </motion.div>

          {menuItems.map((item, index) => (
            <MenuItem 
              key={item.title}
              icon={item.icon} 
              title={item.title}
              right={item.right}
              index={index + 1}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

interface MenuItemProps {
  icon: React.ReactNode;
  title: string;
  right?: React.ReactNode;
  index: number;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, title, right, index }) => {
  const menuItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { 
        delay: custom * 0.1,
        duration: 0.5
      }
    })
  };

  return (
    <motion.div
      custom={index}
      variants={menuItemVariants}
      initial="hidden"
      animate="visible"
      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors duration-300"
      whileHover={{ backgroundColor: "#F9FAFB" }}
    >
      <div className="flex items-center space-x-3">
        <span className="text-yellow-500">{icon}</span>
        <span className="font-medium">{title}</span>
      </div>
      {right && (
        <span>{right}</span>
      )}
    </motion.div>
  );
};

const menuItems = [
  {
    icon: <Ticket size={20} />,
    title: 'Bookings'
  },
  {
    icon: <Wallet size={20} />,
    title: 'Wallet',
    right: <span className="text-sm text-green-600 font-medium">₹500</span>
  },
  {
    icon: <Star size={20} />,
    title: 'Loyalty Points',
    right: <span className="text-sm text-yellow-600 font-medium">250</span>
  },
  {
    icon: <HelpCircle size={20} />,
    title: 'Help & Feedback'
  },
  {
    icon: <Bell size={20} />,
    title: 'Notifications',
    right: <span className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">3</span>
  },
  {
    icon: <Gift size={20} />,
    title: 'Rewards'
  }
];

export default MobileMenu;