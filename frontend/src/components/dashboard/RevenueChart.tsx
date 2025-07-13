// src/components/dashboard/RevenueChart.tsx
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '../ui/Card';
import { MonthlyRevenue } from '../../types/vendorDashboard';

interface RevenueChartProps {
  data: MonthlyRevenue[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0c0c10] p-3 rounded border border-[#333333] shadow-lg">
        <p className="text-gray-300 font-medium">{label}</p>
        <p className="text-[#0066F5] font-medium">{formatCurrency(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-white">Monthly Revenue</h3>
      </div>
      
      <div className="h-84">
        <div style={{ width: '100%', height: '100%' }}>
          <ResponsiveContainer width="100%" height="90%">
            <AreaChart
              data={data}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0066F5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0066F5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333333" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#999999' }} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#999999' }}
                tickFormatter={(value) => `₹${value / 1000}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#0066F5"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
                activeDot={{ r: 6, fill: "#0066F5", stroke: "#fff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* Legend Dot and Label */}
          <div className="mt-2 flex items-center justify-center text-sm text-white">
            <div className="w-3 h-3 rounded-full bg-[#0066F5] mr-2" />
            <span>Revenue</span>
          </div>
        </div>

      </div>
    </Card>
  );
};

export default RevenueChart;