import React, { useMemo } from 'react';
import { useTheater } from './TheaterContext';
import { BarChart, Currency as CurrencyRupee, Users } from 'lucide-react';

const TheaterStats: React.FC = () => {
  const { currentLayout } = useTheater();
  
  const stats = useMemo(() => {
    if (!currentLayout) return null;
    
    const regularCount = currentLayout.seats.filter(s => s.type === 'regular').length;
    const premiumCount = currentLayout.seats.filter(s => s.type === 'premium').length;
    const vipCount = currentLayout.seats.filter(s => s.type === 'vip').length;
    const unavailableCount = currentLayout.seats.filter(s => s.type === 'unavailable').length;
    const totalSeats = regularCount + premiumCount + vipCount;
    
    const regularRevenue = regularCount * currentLayout.prices.regular;
    const premiumRevenue = premiumCount * currentLayout.prices.premium;
    const vipRevenue = vipCount * currentLayout.prices.vip;
    const totalRevenue = regularRevenue + premiumRevenue + vipRevenue;
    
    // Calculate fill percentages for visualization
    const total = totalSeats + unavailableCount || 1; // Avoid division by zero
    const regularPercent = (regularCount / total) * 100;
    const premiumPercent = (premiumCount / total) * 100;
    const vipPercent = (vipCount / total) * 100;
    const unavailablePercent = (unavailableCount / total) * 100;
    
    return {
      regularCount,
      premiumCount,
      vipCount,
      unavailableCount,
      totalSeats,
      regularRevenue,
      premiumRevenue,
      vipRevenue,
      totalRevenue,
      regularPercent,
      premiumPercent,
      vipPercent,
      unavailablePercent
    };
  }, [currentLayout]);
  
  if (!stats) return null;
  
  return (
    <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="border-b border-gray-700">
        <h3 className="px-4 py-3 text-lg font-medium text-blue-400 flex items-center">
          <BarChart size={18} className="mr-2" />
          Layout Stats
        </h3>
      </div>
      
      <div className="p-4">
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <h4 className="font-medium text-gray-300 flex items-center">
              <Users size={16} className="mr-1.5" />
              Seat Count
            </h4>
            <span className="text-white font-medium">{stats.totalSeats}</span>
          </div>
          
          {/* Visual bar chart for seat distribution */}
          <div className="h-3 bg-gray-700 rounded-full overflow-hidden flex">
            <div 
              className="bg-blue-600 h-full"
              style={{ width: `${stats.regularPercent}%` }}
              title={`Regular: ${stats.regularCount} seats`}
            />
            <div 
              className="bg-purple-600 h-full"
              style={{ width: `${stats.premiumPercent}%` }}
              title={`Premium: ${stats.premiumCount} seats`}
            />
            <div 
              className="bg-amber-500 h-full"
              style={{ width: `${stats.vipPercent}%` }}
              title={`VIP: ${stats.vipCount} seats`}
            />
            <div 
              className="bg-gray-600 h-full"
              style={{ width: `${stats.unavailablePercent}%` }}
              title={`Unavailable: ${stats.unavailableCount} seats`}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm mt-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 flex items-center">
                <span className="w-2 h-2 bg-blue-600 rounded-full inline-block mr-1.5" />
                Regular:
              </span>
              <span className="font-medium text-blue-400">{stats.regularCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 flex items-center">
                <span className="w-2 h-2 bg-purple-600 rounded-full inline-block mr-1.5" />
                Premium:
              </span>
              <span className="font-medium text-purple-400">{stats.premiumCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 flex items-center">
                <span className="w-2 h-2 bg-amber-500 rounded-full inline-block mr-1.5" />
                VIP:
              </span>
              <span className="font-medium text-amber-400">{stats.vipCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 flex items-center">
                <span className="w-2 h-2 bg-gray-600 rounded-full inline-block mr-1.5" />
                Unavailable:
              </span>
              <span className="font-medium text-gray-500">{stats.unavailableCount}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-5">
          <div className="flex items-center justify-between text-sm mb-2">
            <h4 className="font-medium text-gray-300 flex items-center">
              <CurrencyRupee size={16} className="mr-1.5" />
              Potential Revenue
            </h4>
            <span className="text-green-400 font-medium">₹{stats.totalRevenue.toLocaleString('en-IN')}</span>
          </div>
          
          {/* Visual bar chart for revenue distribution */}
          <div className="h-3 bg-gray-700 rounded-full overflow-hidden flex">
            <div 
              className="bg-blue-600 h-full"
              style={{ width: `${(stats.regularRevenue / stats.totalRevenue) * 100}%` }}
              title={`Regular: ₹${stats.regularRevenue.toLocaleString('en-IN')}`}
            />
            <div 
              className="bg-purple-600 h-full"
              style={{ width: `${(stats.premiumRevenue / stats.totalRevenue) * 100}%` }}
              title={`Premium: ₹${stats.premiumRevenue.toLocaleString('en-IN')}`}
            />
            <div 
              className="bg-amber-500 h-full"
              style={{ width: `${(stats.vipRevenue / stats.totalRevenue) * 100}%` }}
              title={`VIP: ₹${stats.vipRevenue.toLocaleString('en-IN')}`}
            />
          </div>
          
          <div className="space-y-2 text-sm mt-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 flex items-center">
                <span className="w-2 h-2 bg-blue-600 rounded-full inline-block mr-1.5" />
                Regular:
              </span>
              <span className="font-medium">₹{stats.regularRevenue.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 flex items-center">
                <span className="w-2 h-2 bg-purple-600 rounded-full inline-block mr-1.5" />
                Premium:
              </span>
              <span className="font-medium">₹{stats.premiumRevenue.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 flex items-center">
                <span className="w-2 h-2 bg-amber-500 rounded-full inline-block mr-1.5" />
                VIP:
              </span>
              <span className="font-medium">₹{stats.vipRevenue.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-700">
          <div className="text-xs text-gray-400 flex items-center justify-between">
            <span>Layout dimensions:</span>
            <span className="text-gray-300">{currentLayout?.rowCount} rows × {currentLayout?.columnCount} columns</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TheaterStats;