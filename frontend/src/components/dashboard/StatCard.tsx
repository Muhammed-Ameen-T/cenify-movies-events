import React from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: {
    value: number;
    isPositive: boolean;
  };
  bgColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  change,
  bgColor = 'from-[#0066F5]/10 to-[#0066F5]/5'
}) => {
  return (
    <Card className="p-6">
      <div className="flex justify-between">
        <div>
          <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
          <div className="mt-2 flex items-baseline">
            <p className="text-2xl font-semibold text-white">{value}</p>
            
            {change && (
              <span className={`
                ml-2 text-xs font-medium flex items-center 
                ${change.isPositive ? 'text-green-400' : 'text-red-400'}
              `}>
                {change.isPositive ? '↑' : '↓'} {Math.abs(change.value)}%
              </span>
            )}
          </div>
        </div>
        
        <div className={`
          w-12 h-12 rounded-lg flex items-center justify-center
          bg-gradient-to-br ${bgColor}
        `}>
          {icon}
        </div>
      </div>
      
      {change && (
        <div className="mt-4 text-xs text-gray-400">
          {change.isPositive ? 'Increased' : 'Decreased'} compared to last month
        </div>
      )}
    </Card>
  );
};

export default StatCard;