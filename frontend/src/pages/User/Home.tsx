import React from 'react';
import Carousel from '../../components/User/HeroCarousel';
import Footer from '../../components/User/Footer';
import MovieSection from '../../components/User/MovieSection';
import EventsSection from '../../components/User/EventsSection';
import MoviePassSection from '../../components/User/MoviePassSection';
import SpecialOffersSection from '../../components/User/SpecialOffersSection';

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white">

      <Carousel />

      <div className="flex-grow">
        <MovieSection />
        {/* <EventsSection /> */}
        <MoviePassSection />
        <SpecialOffersSection />
        <Footer />
      </div>

    </div>
  );
};

export default HomePage;