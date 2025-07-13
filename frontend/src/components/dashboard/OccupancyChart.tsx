// src/components/dashboard/OccupancyChart.tsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '../ui/Card';
import { OccupancyRate } from '../../types/vendorDashboard';

interface OccupancyChartProps {
  data: OccupancyRate[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0c0c10] p-3 rounded border border-[#333333] shadow-lg">
        <p className="text-gray-300 font-medium">{label}</p>
        <p className="text-[#f5005f] font-medium">Occupancy Rate: {payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

const OccupancyChart: React.FC<OccupancyChartProps> = ({ data }) => {
  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-white">Theater Occupancy Rates</h3>
        
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 5, left: 5, bottom: 20 }}
            barSize={50}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333333" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#999999' }}
              angle={-45}
              textAnchor="end"
              height={70}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#999999' }}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="rate"
              fill="#f5005f"
              radius={[4, 4, 0, 0]}
              background={{ fill: '#333333', radius: [4, 4, 0, 0] }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default OccupancyChart;