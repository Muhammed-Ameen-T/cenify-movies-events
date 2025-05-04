import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
  color: 'primary' | 'secondary' | 'success' | 'error';
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  isPositive,
  icon,
  color
}) => {
  const getGradient = () => {
    switch(color) {
      case 'primary':
        return 'from-primary-500/20 to-primary-600/5';
      case 'secondary':
        return 'from-secondary-500/20 to-secondary-600/5';
      case 'success':
        return 'from-success-500/20 to-success-600/5';
      case 'error':
        return 'from-error-500/20 to-error-600/5';
      default:
        return 'from-primary-500/20 to-primary-600/5';
    }
  };

  const getBorderColor = () => {
    switch(color) {
      case 'primary':
        return 'border-primary-500/30';
      case 'secondary':
        return 'border-secondary-500/30';
      case 'success':
        return 'border-success-500/30';
      case 'error':
        return 'border-error-500/30';
      default:
        return 'border-primary-500/30';
    }
  };

  return (
    <motion.div 
      className={`card hover:scale-105 border ${getBorderColor()} bg-gradient-to-br ${getGradient()}`}
      whileHover={{ 
        y: -5,
        transition: { duration: 0.2 }
      }}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <h3 className="text-2xl font-bold mt-2 mb-1">{value}</h3>
          <div className="flex items-center">
            {isPositive ? (
              <ArrowUp size={16} className="text-success-500 mr-1" />
            ) : (
              <ArrowDown size={16} className="text-error-500 mr-1" />
            )}
            <span className={isPositive ? 'text-success-500' : 'text-error-500'}>
              {change}
            </span>
            <span className="text-xs text-gray-400 ml-1">vs last month</span>
          </div>
        </div>
        <div className="bg-dark-300 p-3 rounded-lg">
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;