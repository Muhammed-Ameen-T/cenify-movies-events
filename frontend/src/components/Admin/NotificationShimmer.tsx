// src/components/Shared/ShimmerNotification.tsx
import React from 'react';
import { motion } from 'framer-motion';

const ShimmerNotification: React.FC = () => {
  return (
    <motion.div
      className="bg-gray-800/80 rounded-xl p-4 shadow-sm border border-gray-700/50 animate-pulse"
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          {/* Icon Placeholder */}
          <div className="bg-gray-700 p-2 rounded-lg shadow-sm flex-shrink-0 w-8 h-8" />
          <div className="flex-1 min-w-0 space-y-3">
            {/* Title Placeholder */}
            <div className="h-5 bg-gray-700 rounded w-3/4" />
            {/* Message Placeholder */}
            <div className="h-4 bg-gray-700 rounded w-full" />
            <div className="h-4 bg-gray-700 rounded w-5/6" />
            {/* Metadata Placeholder */}
            <div className="flex items-center gap-3">
              <div className="h-3 bg-gray-700 rounded w-20" />
              <div className="h-3 bg-gray-700 rounded w-16" />
              <div className="h-3 bg-gray-700 rounded w-12" />
            </div>
          </div>
        </div>
        {/* Button Placeholder */}
        <div className="bg-gray-700 p-1 rounded-full w-6 h-6 flex-shrink-0" />
      </div>
    </motion.div>
  );
};

export default ShimmerNotification;