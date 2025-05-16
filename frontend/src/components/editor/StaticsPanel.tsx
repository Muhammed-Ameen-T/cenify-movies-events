import React from 'react';
import { calculateTotalCapacity, calculateTotalRevenue } from '../../utils/seatGenerator';
import { SeatLayout } from '../../types/theater';

interface StatisticsPanelProps {
  layout: SeatLayout;
  darkMode: boolean;
}

const StatisticsPanel: React.FC<StatisticsPanelProps> = ({ layout, darkMode }) => {
  const totalSeats = calculateTotalCapacity(layout);
  const totalRevenue = calculateTotalRevenue(layout);

  return (
    <div className={`p-4 rounded-lg ${darkMode ? 'bg-[#2B2B40]' : 'bg-gray-100'} mb-4`}>
      <h4 className="font-medium mb-3">Theater Statistics</h4>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Total Capacity:
          </span>
          <span className="font-medium">{totalSeats} seats</span>
        </div>
        <div className="flex justify-between items-center">
          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Potential Revenue:
          </span>
          <span className="font-medium text-green-500">₹{totalRevenue.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPanel;