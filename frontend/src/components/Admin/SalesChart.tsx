// components/SalesChart.tsx
import React from 'react';
import { ChevronDown } from 'lucide-react';

const SalesChart: React.FC = () => {
  return (
    <div className="p-6 bg-gray-800 rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Sales Details</h3>
        <button className="flex items-center px-3 py-1 text-sm text-gray-300 bg-gray-700 rounded">
          October <ChevronDown className="w-4 h-4 ml-1" />
        </button>
      </div>

      <div className="relative">
        <div className="h-64">
          {/* In a real implementation, you would use a charting library like Recharts */}
          <img 
            src="/api/placeholder/1100/300" 
            alt="Sales Chart" 
            className="object-cover w-full h-full rounded"
          />
        </div>
        
        {/* This is a placeholder for the data point popup */}
        <div className="absolute text-sm text-white bg-blue-600 rounded py-1 px-2 top-1/4 left-1/2">
          64,3664.77
        </div>
      </div>
    </div>
  );
};

export default SalesChart;