// src/components/dashboard/TopSellingShows.tsx
import React from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { TopSellingShow } from '../../types/vendorDashboard';

interface TopSellingShowsProps {
  shows: TopSellingShow[];
}

const TopSellingShows: React.FC<TopSellingShowsProps> = ({ shows }) => {
  const totalTickets = shows.reduce((sum, show) => sum + show.tickets, 0) || 1526; // Fallback to avoid division by zero

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-white">Top Selling Shows</h3>
      </div>
      
      <div className="space-y-4">
        {shows.map((show, index) => (
          <div
            key={show.id.toString()}
            className="flex items-center p-3 rounded-lg hover:bg-[#121218] transition-colors"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#333333] text-white font-medium">
              {index + 1}
            </div>
            <div className="ml-4 flex-1">
              <div className="flex justify-between">
                <h4 className="text-white font-medium">{show.title}</h4>
                <span className="text-sm font-medium text-[#0066F5]">
                  ₹{show.revenue}
                </span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-sm text-gray-400">{show.tickets} tickets</span>
                <Badge
                  label={`${Math.round((show.tickets / totalTickets) * 100)}% of sales`}
                  variant="default"
                  size="sm"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default TopSellingShows;