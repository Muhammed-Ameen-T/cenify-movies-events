import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MonthlyRevenue } from '../../types/vendorDashboard';

interface RevenueChartProps {
  data: MonthlyRevenue[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700/50 p-4 rounded-xl shadow-2xl">
        <p className="text-gray-300 font-medium text-sm mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
          <p className="text-blue-400 font-semibold text-lg">{formatCurrency(payload[0].value)}</p>
        </div>
      </div>
    );
  }
  return null;
};

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  // Calculate revenue statistics
  const totalRevenue = data.reduce((sum, item) => sum + item.value, 0);
  const averageRevenue = totalRevenue / data.length || 0;
  const currentMonth = data[data.length - 1]?.value || 0;
  const previousMonth = data[data.length - 2]?.value || 0;
  const growthPercentage = previousMonth ? ((currentMonth - previousMonth) / previousMonth * 100) : 0;

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6 shadow-xl">
      {/* Header with Stats */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">Monthly Revenue</h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-400 font-medium">Live Data</span>
          </div>
        </div>

        {/* Revenue Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-800/30 rounded-xl p-3 border border-gray-700/30">
            <div className="text-xs text-gray-400 font-medium mb-1">Total Revenue</div>
            <div className="text-lg font-bold text-white">{formatCurrency(totalRevenue)}</div>
          </div>
          
          <div className="bg-gray-800/30 rounded-xl p-3 border border-gray-700/30">
            <div className="text-xs text-gray-400 font-medium mb-1">Average</div>
            <div className="text-lg font-bold text-white">{formatCurrency(averageRevenue)}</div>
          </div>
          
          <div className="bg-gray-800/30 rounded-xl p-3 border border-gray-700/30">
            <div className="text-xs text-gray-400 font-medium mb-1">Growth</div>
            <div className={`text-lg font-bold flex items-center gap-1 ${growthPercentage >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              <svg className={`w-4 h-4 ${growthPercentage >= 0 ? 'rotate-0' : 'rotate-180'}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              {Math.abs(growthPercentage).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="h-130 relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.4} />
                <stop offset="50%" stopColor="#3B82F6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#1E40AF" stopOpacity={0} />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              stroke="#374151" 
              strokeOpacity={0.3}
            />
            
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 500 }}
              tickMargin={10}
            />
            
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 500 }}
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              tickMargin={10}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            <Area
              type="monotone"
              dataKey="value"
              stroke="#3B82F6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorRevenue)"
              filter="url(#glow)"
              activeDot={{ 
                r: 8, 
                fill: "#3B82F6", 
                stroke: "#1E293B", 
                strokeWidth: 3,
                filter: "url(#glow)"
              }}
              dot={{ 
                r: 4, 
                fill: "#3B82F6", 
                stroke: "#1E293B", 
                strokeWidth: 2 
              }}
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Chart Legend */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-700/30">
            <div className="w-3 h-3 rounded-full bg-blue-400 shadow-lg shadow-blue-400/50"></div>
            <span className="text-sm font-medium text-gray-300">Monthly Revenue</span>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {data.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-gray-400 text-sm">No revenue data available</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueChart;