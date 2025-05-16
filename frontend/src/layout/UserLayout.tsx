import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/User/Navbar'; // Adjust path to your Navbar
import LoginModal from '../components/User/LoginModal'; // Adjust path
import MobileMenu from '../components/User/MobileMenu'; // Adjust path
import { AnimatePresence } from 'framer-motion';

const UserLayout: React.FC = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Mock user state - in a real app, this would come from Redux
  const user = null; // Replace with useSelector if using Redux

  const toggleLoginModal = () => setShowLoginModal(!showLoginModal);
  const toggleMenu = () => setShowMenu(!showMenu);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar
        onLoginClick={toggleLoginModal}
        onMenuToggle={toggleMenu}
        showMenu={showMenu}
      />
      
      <AnimatePresence mode="wait">
        {showMenu && (
          <MobileMenu
            onClose={toggleMenu}
            onLoginClick={toggleLoginModal}
            user={user}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLoginModal && (
          <LoginModal
            isOpen={showLoginModal}
            onClose={toggleLoginModal}
          />
        )}
      </AnimatePresence>

      <main className="flex-grow pt-16">
        <Outlet /> {/* Renders child routes */}
      </main>
    </div>
  );
};

export default UserLayout;