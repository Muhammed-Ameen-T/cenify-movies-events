import React from 'react';
import { TopTheater } from '../../types/vendorDashboard';

interface TopTheatersProps {
  theaters: TopTheater[];
}

const TopTheaters: React.FC<TopTheatersProps> = ({ theaters }) => {
  const totalRevenue = theaters.reduce((sum, theater) => sum + theater.revenue, 0) || 1; // Fallback to avoid division by zero

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getOccupancyColor = (rate: number) => {
    if (rate >= 75) return 'from-emerald-500 to-green-400';
    if (rate >= 50) return 'from-yellow-500 to-orange-400';
    return 'from-red-500 to-pink-400';
  };

  const getOccupancyBgColor = (rate: number) => {
    if (rate >= 75) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (rate >= 50) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Top Performing Theaters</h3>
        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
      </div>

      {/* Theaters List */}
      <div className="space-y-3">
        {theaters.map((theater, index) => {
          const revenuePercentage = Math.round((theater.revenue / totalRevenue) * 100);
          
          return (
            <div
              key={theater.id.toString()}
              className="group relative bg-gray-800/30 hover:bg-gray-800/50 border border-gray-700/30 hover:border-gray-600/50 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10"
            >
              {/* Ranking Badge */}
              <div className="absolute -left-2 -top-2 flex items-center justify-center w-7 h-7 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full text-white text-sm font-bold shadow-lg">
                {index + 1}
              </div>

              <div className="flex items-start justify-between">
                {/* Theater Info */}
                <div className="flex-1 min-w-0 pl-3">
                  <h4 className="text-white font-medium text-lg truncate mb-1 group-hover:text-purple-300 transition-colors">
                    {theater.name}
                  </h4>

                  {/* Stats Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-gray-300">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium">{theater.tickets?.toLocaleString() || 0} tickets</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {/* Occupancy Rate */}
                      <div className={`px-2 py-1 text-xs font-medium rounded-md border ${getOccupancyBgColor(theater.occupancyRate)}`}>
                        {Math.round(theater.occupancyRate)}% occupancy
                      </div>
                      
                      {/* Revenue */}
                      <div className="text-right">
                        <div className="text-lg font-bold text-purple-400">{formatCurrency(theater.revenue)}</div>
                        <div className="text-xs text-gray-500">{revenuePercentage}% share</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Revenue Progress Bar */}
              <div className="mt-3 w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${revenuePercentage}%` }}
                ></div>
              </div>

              {/* Occupancy Progress Bar */}
              <div className="mt-2 w-full bg-gray-800 rounded-full h-1 overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${getOccupancyColor(theater.occupancyRate)} rounded-full transition-all duration-500 ease-out`}
                  style={{ width: `${theater.occupancyRate}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {theaters.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 16V4a2 2 0 012-2h6a2 2 0 012 2v12M7 16h10" />
            </svg>
          </div>
          <p className="text-gray-400 text-sm">No theater data available</p>
        </div>
      )}
    </div>
  );
};

export default TopTheaters;