import React from 'react';
import { Users, Film, DollarSign, CalendarCheck, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

// Define specific icon types for better type safety
type IconType = typeof Users | typeof Film | typeof DollarSign | typeof CalendarCheck;

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactElement<{ className?: string }>;
  trend: {
    value: number;
    label: string;
    up: boolean;
  };
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, color }) => {
  return (
    <motion.div
      className={`${color} p-6 rounded-xl shadow-lg border border-gray-800`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}
      role="region"
      aria-label={`${title} statistic`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-300">{title}</h3>
          <p className="mt-1 text-3xl font-semibold text-white">{value}</p>
        </div>
        <div className="p-3 bg-white bg-opacity-10 rounded-lg">{icon}</div>
      </div>
      <div className="mt-4">
        <span
          className={`inline-flex items-center text-sm ${
            trend.up ? 'text-green-400' : 'text-red-400'
          }`}
        >
          {trend.up ? (
            <TrendingUp className="w-4 h-4 mr-1" />
          ) : (
            <TrendingDown className="w-4 h-4 mr-1" />
          )}
          {trend.value}% {trend.label}
        </span>
      </div>
    </motion.div>
  );
};

const DashboardStats: React.FC = () => {
  const stats: StatCardProps[] = [
    {
      title: 'Total Users',
      value: '40,689',
      icon: <Users className="w-6 h-6 text-blue-300" />,
      trend: { value: 8.5, label: 'Up from yesterday', up: true },
      color: 'bg-gradient-to-br from-blue-900 to-blue-800',
    },
    {
      title: 'Total Theaters',
      value: '10,293',
      icon: <Film className="w-6 h-6 text-purple-300" />,
      trend: { value: 1.3, label: 'Up from past week', up: true },
      color: 'bg-gradient-to-br from-purple-900 to-purple-800',
    },
    {
      title: 'Total Revenue',
      value: '$89,000',
      icon: <DollarSign className="w-6 h-6 text-green-300" />,
      trend: { value: 4.3, label: 'Down from yesterday', up: false },
      color: 'bg-gradient-to-br from-green-900 to-green-800',
    },
    {
      title: 'Total Bookings',
      value: '2,040',
      icon: <CalendarCheck className="w-6 h-6 text-orange-300" />,
      trend: { value: 1.8, label: 'Up from yesterday', up: true },
      color: 'bg-gradient-to-br from-orange-900 to-orange-800',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <motion.div
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </motion.div>
  );
};

export default DashboardStats;