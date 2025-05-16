import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import axios from 'axios';

// TMDB Credentials
const API_KEY = import.meta.env.VITE_TMDB_API_KEY
const ACCESS_TOKEN = import.meta.env.VITE_TMDB_ACCESS_TOKEN;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w1280';
// Fallback image for movies without a poster
const FALLBACK_IMAGE = 'https://via.placeholder.com/1280x720?text=No+Image+Available';

// Interface for TMDB movie data
interface Movie {
  id: number;
  title: string;
  tagline?: string;
  overview: string;
  backdrop_path: string | null;
  release_date: string;
}

// Interface for slide data
interface Slide {
  img: string;
  title: string;
  subtitle: string;
  desc: string;
}

const Carousel: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch movies from TMDB
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${BASE_URL}/movie/popular`, {
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
          },
          params: {
            api_key: API_KEY,
            language: 'en-US',
            page: 1,
          },
        });

        const movies: Movie[] = response.data.results.slice(0, 4); // Get 4 movies
        const formattedSlides: Slide[] = movies.map((movie) => ({
          img: movie.backdrop_path ? `${IMAGE_BASE_URL}${movie.backdrop_path}` : FALLBACK_IMAGE,
          title: movie.title.toUpperCase(),
          subtitle: movie.tagline || 'NOW PLAYING',
          desc: movie.overview.slice(0, 100) + '...' || `Releasing on ${movie.release_date}`,
        }));

        setSlides(formattedSlides);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching TMDB data:', err);
        setError('Failed to load movies. Please try again later.');
        setIsLoading(false);
        // Fallback to mock data in case of error
        setSlides([
          {
            img: FALLBACK_IMAGE,
            title: 'FALLBACK MOVIE 1',
            subtitle: 'ENJOY THE SHOW',
            desc: 'A cinematic experience',
          },
          {
            img: FALLBACK_IMAGE,
            title: 'FALLBACK MOVIE 2',
            subtitle: 'ACTION PACKED',
            desc: 'An thrilling adventure',
          },
          {
            img: FALLBACK_IMAGE,
            title: 'FALLBACK MOVIE 3',
            subtitle: 'EPIC JOURNEY',
            desc: 'A visual masterpiece',
          },
          {
            img: FALLBACK_IMAGE,
            title: 'FALLBACK MOVIE 4',
            subtitle: 'COMING SOON',
            desc: 'Stay tuned for more',
          },
        ]);
      }
    };

    fetchMovies();
  }, []);

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (isLoading || error) return;
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length, isLoading, error]);

  // Parallax effect
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, 50]);

  // Slide animation variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.5 },
      },
    },
    exit: (direction: number) => ({
      x: direction > 0 ? '-100%' : '100%',
      opacity: 0,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.5 },
      },
    }),
  };

  // Content animation variants
  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.3,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  // Navigation handlers
  const handleNext = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  // Swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedLeft: handleNext,
    onSwipedRight: handlePrev,
    trackMouse: true,
    delta: 10,
  });

  // Loading spinner
  if (isLoading) {
    return (
      <div className="relative w-full h-72 md:h-[600px] mt-16 flex items-center justify-center bg-gray-200">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-yellow-400"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="relative w-full h-72 md:h-[600px] mt-16 flex items-center justify-center bg-gray-200 text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-72 md:h-[600px] overflow-hidden"
      {...swipeHandlers}
      role="region"
      aria-label="Movie carousel"
    >
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentSlide}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0 w-full h-full"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10" />
          <motion.img
            src={slides[currentSlide].img}
            alt={slides[currentSlide].title}
            className="w-full h-full object-cover"
            style={{ y }}
            loading="lazy"
          />

          <motion.div
            className="absolute inset-0 flex items-end p-4 sm:p-6 md:p-10 z-20"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="w-full max-w-7xl mx-auto text-white text-left">
              <motion.h2
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight"
                variants={itemVariants}
              >
                {slides[currentSlide].title}
              </motion.h2>
              <motion.p
                className="text-base sm:text-lg md:text-xl lg:text-2xl font-medium mt-1 sm:mt-2"
                variants={itemVariants}
              >
                {slides[currentSlide].subtitle}
              </motion.p>
              <motion.p
                className="text-xs sm:text-sm md:text-base mt-1 sm:mt-2 opacity-80 max-w-2xl"
                variants={itemVariants}
              >
                {slides[currentSlide].desc}
              </motion.p>
              <motion.button
                className="mt-3 sm:mt-4 bg-yellow-400 font-semibold text-black px-4 sm:px-6 py-2 rounded-full hover:bg-yellow-500 transition text-sm sm:text-base"
                variants={itemVariants}
                whileHover={{ scale: 1.05, backgroundColor: '#EAB308' }}
                whileTap={{ scale: 0.95 }}
                aria-label={`Book tickets for ${slides[currentSlide].title}`}
              >
                Book Now
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation arrows */}
      <motion.button
        onClick={handlePrev}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/50 text-white flex items-center justify-center z-30 hover:bg-black/70 transition"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Previous slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </motion.button>

      <motion.button
        onClick={handleNext}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/50 text-white flex items-center justify-center z-30 hover:bg-black/70 transition"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Next slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </motion.button>

      {/* Indicators */}
      <div className="absolute bottom-2 sm:bottom-4 left-0 right-0 flex justify-center space-x-2 z-30">
        {slides.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => {
              setDirection(index > currentSlide ? 1 : -1);
              setCurrentSlide(index);
            }}
            className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all ${
              index === currentSlide ? 'bg-yellow-400 scale-125' : 'bg-white/50'
            }`}
            whileHover={{ scale: 1.3 }}
            animate={index === currentSlide ? { scale: [1, 1.3, 1] } : { scale: 1 }}
            transition={{ duration: 0.5 }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;