import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/User/Navbar'; 
import LoginModal from '../components/User/LoginModal'; 
// import MobileMenu from '../components/User/MobileMenu';
import { AnimatePresence } from 'framer-motion';
// import Footer from '../components/User/Footer';

const UserLayout: React.FC = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  // const [showMenu, setShowMenu] = useState(false);

  const toggleLoginModal = () => setShowLoginModal(!showLoginModal);
  // const toggleMenu = () => setShowMenu(!showMenu);

  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      <Navbar/>

      <AnimatePresence>
        {showLoginModal && (
          <LoginModal
            isOpen={showLoginModal}
            onClose={toggleLoginModal}
          />
        )}
      </AnimatePresence>

      <main className="flex-grow pt-16">
        <Outlet /> 
      </main>
    </div>
  );
};

export default UserLayout;