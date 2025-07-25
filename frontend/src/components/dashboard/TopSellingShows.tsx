import React from 'react';
import { TopSellingShow } from '../../types/vendorDashboard';

interface TopSellingShowsProps {
  shows: TopSellingShow[];
}

const TopSellingShows: React.FC<TopSellingShowsProps> = ({ shows }) => {
  const totalTickets = shows.reduce((sum, show) => sum + show.tickets, 0) || 1526; // Fallback to avoid division by zero

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const dateOptions: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric' 
    };
    const timeOptions: Intl.DateTimeFormatOptions = { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    };
    
    return {
      date: date.toLocaleDateString('en-US', dateOptions),
      time: date.toLocaleTimeString('en-US', timeOptions)
    };
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Top Selling Shows</h3>
        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
      </div>

      {/* Shows List */}
      <div className="space-y-3">
        {shows.map((show, index) => {
          const { date, time } = formatDateTime(show.showTime);
          const salesPercentage = Math.round((show.tickets / totalTickets) * 100);
          
          return (
            <div
              key={show.id.toString()}
              className="group relative bg-gray-800/30 hover:bg-gray-800/50 border border-gray-700/30 hover:border-gray-600/50 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
            >
              {/* Ranking Badge */}
              <div className="absolute -left-2 -top-2 flex items-center justify-center w-7 h-7 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white text-sm font-bold shadow-lg">
                {index + 1}
              </div>

              <div className="flex items-start justify-between">
                {/* Show Info */}
                <div className="flex-1 min-w-0 pl-3">
                  <h4 className="text-white font-medium text-lg truncate mb-1 group-hover:text-blue-300 transition-colors">
                    {show.title}
                  </h4>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      <span>{date}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <span>{time}</span>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-gray-300">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium">{show.tickets} tickets</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {/* Sales Percentage */}
                      <div className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-md border border-emerald-500/30">
                        {salesPercentage}% sales
                      </div>
                      
                      {/* Revenue */}
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-400">₹{show.revenue}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3 w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${salesPercentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {shows.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-400 text-sm">No shows data available</p>
        </div>
      )}
    </div>
  );
};

export default TopSellingShows;