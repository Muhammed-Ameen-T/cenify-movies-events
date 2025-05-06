import React from 'react';
import { motion } from 'framer-motion';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: 'easeInOut' },
  },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

const spinnerVariants = {
  animate: {
    rotate: 360,
    transition: {
      repeat: Infinity,
      duration: 1,
      ease: 'linear',
    },
  },
};

const pulseVariants = {
  animate: {
    scale: [1, 1.1, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: 'easeInOut',
    },
  },
};

const Loader: React.FC = () => {
  return (
    <motion.div
      className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      aria-label="Loading content"
    >
      <div className="flex flex-col items-center">
        <motion.div
          className="w-16 h-16 rounded-full border-4 border-yellow-500 border-t-transparent shadow-lg"
          variants={spinnerVariants}
          animate="animate"
        />
        <motion.p
          className="mt-4 text-lg font-semibold text-yellow-600"
          variants={pulseVariants}
          animate="animate"
        >
          Loading...
        </motion.p>
      </div>
    </motion.div>
  );
};

export default Loader;