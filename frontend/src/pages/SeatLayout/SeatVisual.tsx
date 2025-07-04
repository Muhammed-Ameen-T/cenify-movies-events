import React from 'react';
import { SeatType } from './theater.types';
import { motion } from 'framer-motion';

interface SeatVisualProps {
  type: SeatType;
  isSelected: boolean;
  number?: string;
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}

const SeatVisual: React.FC<SeatVisualProps> = ({ 
  type, 
  isSelected, 
  number, 
  onClick, 
  style 
}) => {
  // Base styles for all seat types
  const baseClasses = "w-10 h-10 flex items-center justify-center rounded-md transition-all duration-200";
  
  // Type-specific styles
  const typeClasses = {
    regular: "bg-blue-600 hover:bg-blue-500 text-white shadow-md",
    premium: "bg-purple-600 hover:bg-purple-500 text-white shadow-md",
    vip: "bg-amber-500 hover:bg-amber-400 text-black font-bold shadow-md",
    unavailable: "bg-gray-700 hover:bg-gray-600 text-gray-400"
  };
  
  // Selection styles
  const selectionClasses = isSelected 
    ? "ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-105 z-10" 
    : "ring-0";

  return (
    <motion.div
      className={`${baseClasses} ${typeClasses[type]} ${selectionClasses} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      style={style}
      whileHover={{ scale: isSelected ? 1.05 : 1.03 }}
      whileTap={{ scale: 0.95 }}
      animate={{ 
        boxShadow: isSelected 
          ? '0 0 0 2px rgba(255, 255, 255, 0.8), 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' 
          : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
      }}
      transition={{ duration: 0.2 }}
    >
      {number && (
        <span className={`text-xs font-medium ${type === 'vip' ? 'text-black' : 'text-inherit'}`}>
          {number}
        </span>
      )}
    </motion.div>
  );
};

export default SeatVisual;