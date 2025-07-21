import React from 'react';
import { motion } from 'framer-motion';

const ShimmerWallet: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0.7 }}
      animate={{ opacity: 1 }}
      transition={{
        repeat: Infinity,
        repeatType: 'reverse',
        duration: 1.5,
        ease: 'easeInOut',
      }}
      className="bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-gray-700/50 animate-pulse"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-2/5 h-4 bg-gray-700 rounded-lg"></div>
        <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
      </div>
      <div className="mb-4">
        <div className="w-3/4 h-8 bg-gray-700 rounded-lg mb-2"></div>
        <div className="w-1/2 h-4 bg-gray-700 rounded-lg"></div>
      </div>
      <div className="flex justify-between items-center">
        <div className="w-1/3 h-4 bg-gray-700 rounded-lg"></div>
        <div className="w-1/4 h-4 bg-gray-700 rounded-lg"></div>
      </div>
    </motion.div>
  );
};

export default ShimmerWallet;