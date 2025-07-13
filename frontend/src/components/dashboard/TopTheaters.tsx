// src/components/dashboard/TopTheaters.tsx
import React from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { TopTheater } from '../../types/vendorDashboard';

interface TopTheatersProps {
  theaters: TopTheater[];
}

const TopTheaters: React.FC<TopTheatersProps> = ({ theaters }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-white">Top Performing Theaters</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-gray-400 border-b border-[#333333]">
              <th className="pb-3 font-medium">Theater</th>
              <th className="pb-3 font-medium">Tickets Sold</th>
              <th className="pb-3 font-medium">Revenue</th>
              <th className="pb-3 font-medium">Occupancy</th>
            </tr>
          </thead>
          <tbody>
            {theaters.map((theater) => (
              <tr 
                key={theater.id.toString()} 
                className="border-b border-[#333333] hover:bg-[#121218] transition-colors"
              >
                <td className="py-3 text-sm text-white font-medium">
                  {theater.name}
                </td>
                <td className="py-3 text-sm text-gray-300">
                  {theater.tickets.toLocaleString()}
                </td>
                <td className="py-3 text-sm text-white font-medium">
                  {formatCurrency(theater.revenue)}
                </td>
                <td className="py-3">
                  <Badge 
                    label={`${Math.round(theater.occupancyRate)}%`} 
                    variant={theater.occupancyRate > 75 ? 'success' : theater.occupancyRate > 50 ? 'warning' : 'danger'}
                    size="sm"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default TopTheaters;