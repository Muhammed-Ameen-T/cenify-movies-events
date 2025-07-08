import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', events: 4, shows: 12, amt: 20 },
  { name: 'Feb', events: 3, shows: 10, amt: 25 },
  { name: 'Mar', events: 2, shows: 8, amt: 22 },
  { name: 'Apr', events: 6, shows: 15, amt: 30 },
  { name: 'May', events: 4, shows: 12, amt: 21 },
  { name: 'Jun', events: 5, shows: 18, amt: 23 },
  { name: 'Jul', events: 8, shows: 24, amt: 34 },
  { name: 'Aug', events: 9, shows: 28, amt: 36 },
  { name: 'Sep', events: 6, shows: 20, amt: 25 },
  { name: 'Oct', events: 8, shows: 22, amt: 30 },
  { name: 'Nov', events: 10, shows: 30, amt: 38 },
  { name: 'Dec', events: 12, shows: 35, amt: 40 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-dark-400 p-3 border border-dark-100 rounded-md shadow-lg">
        <p className="text-sm font-medium text-gray-300">{label}</p>
        <p className="text-sm text-primary-400">
          Events: {payload[0].value}
        </p>
        <p className="text-sm text-secondary-400">
          Shows: {payload[1].value}
        </p>
      </div>
    );
  }

  return null;
};

const EventsOverviewChart: React.FC = () => {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2D3748" />
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="events" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={10} />
          <Bar dataKey="shows" fill="#8B5CF6" radius={[4, 4, 0, 0]} barSize={10} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EventsOverviewChart;