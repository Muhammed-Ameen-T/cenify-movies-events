import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Carousel from '../../components/User/Carousel';
import Footer from '../../components/User/Footer';
import LoginModal from '../../components/User/LoginModal';
import MovieSection from '../../components/User/MovieSection';
import EventsSection from '../../components/User/EventsSection';
import MoviePassSection from '../../components/User/MoviePassSection';
import SpecialOffersSection from '../../components/User/SpecialOffersSection';
import MobileMenu from '../../components/User/MobileMenu';

const HomePage: React.FC = () => {
  // Mock user state - in a real app this would come from Redux
  // const user = null;
  
  // const [showLoginModal, setShowLoginModal] = useState(false);
  // const [showMenu, setShowMenu] = useState(false);

  // const toggleLoginModal = () => setShowLoginModal(!showLoginModal);
  // const toggleMenu = () => setShowMenu(!showMenu);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* <Navbar 
        onLoginClick={toggleLoginModal} 
        onMenuToggle={toggleMenu} 
        showMenu={showMenu} 
        user={user}
      /> */}
      
      

      <Carousel />

      <div className="flex-grow">
        <MovieSection />
        <EventsSection />
        <MoviePassSection />
        <SpecialOffersSection />
      </div>

      <Footer />
    </div>
  );
};

export default HomePage;