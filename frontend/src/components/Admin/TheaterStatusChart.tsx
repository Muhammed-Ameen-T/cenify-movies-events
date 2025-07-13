// src/components/Admin/TheaterStatusChart.tsx
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Shield, AlertCircle, XCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { TheaterStatus } from '../../types/adminDashboard';

interface TheaterStatusChartProps {
  theaterStatus: TheaterStatus[];
}

const statusIcons: { [key: string]: React.ComponentType<{ className: string; style: { color: string } }> } = {
  Verified: Shield,
  Verifying: AlertCircle,
  Pending: Clock,
  Blocked: XCircle,
};

const TheaterStatusChart: React.FC<TheaterStatusChartProps> = ({ theaterStatus }) => {
  const total = theaterStatus.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-xl">
          <p className="text-white font-semibold">{data.name}</p>
          <p className="text-gray-300">Count: {data.value}</p>
          <p className="text-gray-300">
            Percentage: {((data.value / total) * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <motion.div
      className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2">Theater Status</h3>
      </div>

      <div className="h-41">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={theaterStatus}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={80}
              dataKey="value"
            >
              {theaterStatus.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3 mt-4">
        {theaterStatus.map((item) => {
          const IconComponent = statusIcons[item.name] || Clock;
          return (
            <motion.div
              key={item.name}
              className="flex items-center justify-between p-2 bg-gray-700/30 rounded-lg"
              whileHover={{ backgroundColor: 'rgba(55, 65, 81, 0.5)' }}
            >
              <div className="flex items-center space-x-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: item.color }}
                ></div>
                <IconComponent className="w-5 h-5" style={{ color: item.color }} />
                <span className="text-white font-medium">{item.name}</span>
              </div>
              <div className="text-right">
                <p className="text-white font-bold">{item.value}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Total Theaters</span>
          <span className="text-2xl font-bold text-white">{total}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default TheaterStatusChart;  