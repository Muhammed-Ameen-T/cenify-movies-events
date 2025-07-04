// src/layouts/AdminLayout.tsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Admin/Navbar';
import Sidebar from '../components/Admin/Sidebar';
import { AnimatePresence, motion } from 'framer-motion';

interface AdminLayoutProps {
  activePage?: 'dashboard' | 'theaters' | 'shows' | 'bookings' | 'movies' | 'users' | 'notifications';
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ activePage = 'dashboard' }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Toggle mobile menu (passed to Navbar)
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);  

  // Animation variants for sidebar on mobile
  const mobileSidebarVariants = {
    hidden: { x: '-100%', opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.3 } },
    exit: { x: '-100%', opacity: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="flex min-h-screen bg-gray-900">
      {/* Sidebar - Always visible on large screens, toggleable on mobile */}
      <div className="lg:w-64 hidden lg:block sticky">
        <Sidebar activePage={activePage} />
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden"
            variants={mobileSidebarVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Sidebar activePage={activePage} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex flex-col flex-1 sticky">
        <Navbar
          title={activePage.charAt(0).toUpperCase() + activePage.slice(1)}
          onMobileMenuToggle={toggleMobileMenu}
          isMobileMenuOpen={isMobileMenuOpen}
        />
        <main className="flex-1 overflow-y-auto p-0">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleMobileMenu}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminLayout;