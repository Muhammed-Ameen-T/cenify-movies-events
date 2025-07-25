import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { OccupancyRate } from '../../types/vendorDashboard';

interface OccupancyChartProps {
  data: OccupancyRate[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700/50 p-4 rounded-xl shadow-2xl">
        <p className="text-gray-300 font-medium text-sm mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
          <p className="text-emerald-400 font-semibold text-lg">{payload[0].value}%</p>
        </div>
      </div>
    );
  }
  return null;
};

const OccupancyChart: React.FC<OccupancyChartProps> = ({ data }) => {
  // Calculate occupancy statistics
  const averageOccupancy = data.length > 0 ? data.reduce((sum, item) => sum + item.rate, 0) / data.length : 0;
  const highestOccupancy = data.length > 0 ? Math.max(...data.map(item => item.rate)) : 0;
  const lowestOccupancy = data.length > 0 ? Math.min(...data.map(item => item.rate)) : 0;
  const highestTheater = data.find(item => item.rate === highestOccupancy)?.name || 'N/A';

  // Calculate performance indicator
  const getPerformanceColor = (rate: number) => {
    if (rate >= 80) return 'text-emerald-400';
    if (rate >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getPerformanceIcon = (rate: number) => {
    if (rate >= 80) return '↑';
    if (rate >= 60) return '→';
    return '↓';
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6 shadow-xl">
      {/* Header with Stats */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">Theater Occupancy Rates</h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-400 font-medium">Live Data</span>
          </div>
        </div>

        {/* Occupancy Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-800/30 rounded-xl p-3 border border-gray-700/30">
            <div className="text-xs text-gray-400 font-medium mb-1">Average Occupancy</div>
            <div className={`text-lg font-bold flex items-center gap-1 ${getPerformanceColor(averageOccupancy)}`}>
              <span>{getPerformanceIcon(averageOccupancy)}</span>
              {averageOccupancy.toFixed(1)}%
            </div>
          </div>
          
          <div className="bg-gray-800/30 rounded-xl p-3 border border-gray-700/30">
            <div className="text-xs text-gray-400 font-medium mb-1">Highest Rate</div>
            <div className="text-lg font-bold text-emerald-400">{highestOccupancy.toFixed(1)}%</div>
            <div className="text-xs text-gray-500 mt-1 truncate">{highestTheater}</div>
          </div>
          
          <div className="bg-gray-800/30 rounded-xl p-3 border border-gray-700/30">
            <div className="text-xs text-gray-400 font-medium mb-1">Range</div>
            <div className="text-lg font-bold text-white">
              {lowestOccupancy.toFixed(1)}% - {highestOccupancy.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="h-80 relative">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 20, left: 20, bottom: 60 }}
            barSize={40}
          >
            <defs>
              <linearGradient id="colorOccupancy" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                <stop offset="50%" stopColor="#059669" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#047857" stopOpacity={0.4} />
              </linearGradient>
              <filter id="barGlow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
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
              tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 500 }}
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
            />
            
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 500 }}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              tickMargin={10}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            <Bar
              dataKey="rate"
              fill="url(#colorOccupancy)"
              radius={[6, 6, 0, 0]}
              filter="url(#barGlow)"
              background={{ 
                fill: "#374151", 
                fillOpacity: 0.2,
                radius: [6, 6, 0, 0] 
              }}
            />
          </BarChart>
        </ResponsiveContainer>

        {/* Chart Legend */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-700/30">
            <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50"></div>
            <span className="text-sm font-medium text-gray-300">Occupancy Rate</span>
          </div>
        </div>
      </div>

      {/* Performance Indicators */}
      <div className="mt-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
            <span className="text-gray-400">Excellent (80%+)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span className="text-gray-400">Good (60-79%)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            <span className="text-gray-400">Needs Attention (60%)</span>
          </div>
        </div>
        <div className="text-gray-500">
          {data.length} theaters tracked
        </div>
      </div>

      {/* Empty State */}
      {data.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-gray-400 text-sm">No occupancy data available</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OccupancyChart;