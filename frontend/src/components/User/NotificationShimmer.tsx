// src/components/User/ShimmerNotification.tsx
import React from 'react';
import { motion } from 'framer-motion';

// Animation for the shimmer effect
const shimmerVariants = {
  animate: {
    opacity: [0.6, 1, 0.6],
    transition: {
      duration: 1.2,
      repeat: Infinity,
      repeatType: 'loop' as const,
      ease: 'easeInOut',
    },
  },
};

const ShimmerNotification: React.FC = () => {
  return (
    <div className="space-y-3 max-w-7xl mx-auto">
      {/* Render multiple shimmer cards to mimic a loading list */}
      {Array.from({ length: 6 }).map((_, index) => (
        <motion.div
          key={index}
          variants={shimmerVariants}
          animate="animate"
          className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-4 shadow-sm border border-gray-200/50"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              {/* Icon Placeholder */}
              <div className="p-2 rounded-lg shadow-sm flex-shrink-0 w-8 h-8 bg-gray-200/80 dark:bg-gray-700/50" />
              <div className="flex-1 min-w-0 space-y-3">
                {/* Title Placeholder */}
                <div className="h-5 rounded w-3/4 bg-gray-200/80 dark:bg-gray-700/50" />
                {/* Description Placeholder (two lines to match line-clamp-2) */}
                <div className="space-y-2">
                  <div className="h-4 rounded w-full bg-gray-200/80 dark:bg-gray-700/50" />
                  <div className="h-4 rounded w-5/6 bg-gray-200/80 dark:bg-gray-700/50" />
                </div>
                {/* Metadata Placeholder */}
                <div className="flex items-center gap-3">
                  <div className="h-3 rounded w-20 bg-gray-200/80 dark:bg-gray-700/50" />
                  <div className="h-3 rounded w-16 bg-gray-200/80 dark:bg-gray-700/50" />
                </div>
              </div>
            </div>
            {/* Button Placeholder (for unread notifications) */}
            <div className="p-1 rounded-full w-6 h-6 flex-shrink-0 bg-gray-200/80 dark:bg-gray-700/50" />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ShimmerNotification;