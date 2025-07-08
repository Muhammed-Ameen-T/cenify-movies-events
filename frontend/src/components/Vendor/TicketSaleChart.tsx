import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const data = [
  { name: 'Standard', value: 65 },
  { name: 'Premium', value: 25 },
  { name: 'VIP', value: 10 },
];

const COLORS = ['#3B82F6', '#8B5CF6', '#F97316'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-dark-400 p-3 border border-dark-100 rounded-md shadow-lg">
        <p className="text-sm font-medium text-gray-300">{payload[0].name}</p>
        <p className="text-sm" style={{ color: payload[0].color }}>
          {payload[0].value}%
        </p>
      </div>
    );
  }

  return null;
};

const CustomLegend = (props: any) => {
  const { payload } = props;
  
  return (
    <ul className="flex justify-center space-x-6 mt-6">
      {payload.map((entry: any, index: number) => (
        <li key={`item-${index}`} className="flex items-center">
          <div 
            className="w-3 h-3 rounded-full mr-2" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-gray-400">{entry.value}</span>
        </li>
      ))}
    </ul>
  );
};

const TicketSalesChart: React.FC = () => {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TicketSalesChart;