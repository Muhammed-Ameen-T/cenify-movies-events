import React from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { statistics } from '../../utils/mockData';

const TopSellingShows: React.FC = () => {
  const { topSellingShows } = statistics;
  
  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-white">Top Selling Shows</h3>
        <button className="text-sm text-[#0066F5] hover:text-[#3391f7]">View All</button>
      </div>
      
      <div className="space-y-4">
        {topSellingShows.map((show, index) => (
          <div 
            key={show.id}
            className="flex items-center p-3 rounded-lg hover:bg-[#121218] transition-colors"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#333333] text-white font-medium">
              {index + 1}
            </div>
            <div className="ml-4 flex-1">
              <div className="flex justify-between">
                <h4 className="text-white font-medium">{show.title}</h4>
                <span className="text-sm font-medium text-[#0066F5]">
                  ${show.revenue.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-sm text-gray-400">
                  {show.tickets} tickets
                </span>
                <Badge 
                  label={`${Math.round((show.tickets / 1526) * 100)}% of sales`}
                  variant="primary"
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