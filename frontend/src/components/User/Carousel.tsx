import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const slides = [
  { 
    img: 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 
    title: 'INCEPTION', 
    subtitle: 'THE DREAM IS REAL', 
    desc: 'FROM THE DIRECTOR OF THE DARK KNIGHT' 
  },
  { 
    img: 'https://images.pexels.com/photos/8088339/pexels-photo-8088339.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 
    title: 'THE MATRIX', 
    subtitle: 'WELCOME TO THE REAL WORLD', 
    desc: 'A SCI-FI CLASSIC' 
  },
  { 
    img: 'https://images.pexels.com/photos/9088087/pexels-photo-9088087.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 
    title: 'AVATAR', 
    subtitle: 'ENTER THE WORLD OF PANDORA', 
    desc: 'JAMES CAMERON\'S EPIC' 
  },
];

const Carousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.5 }
      }
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -1000 : 1000,
      opacity: 0,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.5 }
      }
    })
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        delay: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  return (
    <div className="relative w-full h-72 md:h-[600px] mt-16 overflow-hidden">
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <img 
            src={slides[currentSlide].img} 
            alt={slides[currentSlide].title} 
            className="w-full h-full object-cover" 
          />
          
          <motion.div 
            className="absolute inset-0 flex items-end p-6 md:p-10"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="w-full max-w-7xl mx-auto text-white text-left">
              <motion.h2 
                className="text-4xl md:text-6xl font-extrabold tracking-tight"
                variants={itemVariants}
              >
                {slides[currentSlide].title}
              </motion.h2>
              <motion.p 
                className="text-lg md:text-2xl font-medium mt-2"
                variants={itemVariants}
              >
                {slides[currentSlide].subtitle}
              </motion.p>
              <motion.p 
                className="text-sm md:text-base mt-1 opacity-80"
                variants={itemVariants}
              >
                {slides[currentSlide].desc}
              </motion.p>
              <motion.button 
                className="mt-4 bg-yellow-400 font-semibold text-black px-6 py-2 rounded-full hover:bg-yellow-500 transition"
                variants={itemVariants}
                whileHover={{ scale: 1.05, backgroundColor: "#EAB308" }}
                whileTap={{ scale: 0.95 }}
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
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 text-white flex items-center justify-center z-10"
        whileHover={{ scale: 1.1, backgroundColor: "rgba(0,0,0,0.5)" }}
        whileTap={{ scale: 0.9 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </motion.button>
      
      <motion.button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 text-white flex items-center justify-center z-10"
        whileHover={{ scale: 1.1, backgroundColor: "rgba(0,0,0,0.5)" }}
        whileTap={{ scale: 0.9 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </motion.button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
        {slides.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => {
              setDirection(index > currentSlide ? 1 : -1);
              setCurrentSlide(index);
            }}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              index === currentSlide ? 'bg-yellow-400' : 'bg-white/50'
            }`}
            whileHover={{ scale: 1.2 }}
            animate={index === currentSlide ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.5 }}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;