import React from 'react';

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
  bgColor = 'from-blue-500 to-purple-600'
}) => {
  return (
    <div className="group bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:border-gray-600/50">
      {/* Header with title and icon */}
      <div className="flex items-start justify-between mb-1">
        <div className="flex-1">
          <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wide mt-3">
            {title}
          </h3>
        </div>
        
        {/* Icon container with gradient background */}
        <div className={`
          w-12 h-12 rounded-xl flex items-center justify-center
          bg-gradient-to-br ${bgColor} shadow-lg group-hover:scale-105 transition-transform duration-300
        `}>
          <div className="text-white">
            {icon}
          </div>
        </div>
      </div>

      {/* Main value */}
      <div className="mb-3">
        <p className="text-3xl font-bold text-white group-hover:text-blue-300 transition-colors duration-300">
          {value}
        </p>
      </div>

      {/* Change indicator and description */}
      {change && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Change percentage with icon */}
            <div className={`
              flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border
              ${change.isPositive 
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                : 'bg-red-500/20 text-red-400 border-red-500/30'
              }
            `}>
              <svg 
                className={`w-3 h-3 ${change.isPositive ? 'rotate-0' : 'rotate-180'}`} 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              {Math.abs(change.value)}%
            </div>
          </div>
          
          {/* Description text */}
          <div className="text-xs text-gray-400">
            vs last month
          </div>
        </div>
      )}

      {/* Progress indicator bar (decorative) */}
      <div className="mt-4 w-full bg-gray-800 rounded-full h-1 overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r ${bgColor} rounded-full transition-all duration-1000 ease-out`}
          style={{ 
            width: change ? `${Math.min(Math.abs(change.value) * 2, 100)}%` : '60%' 
          }}
        ></div>
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </div>
  );
};

export default StatCard;