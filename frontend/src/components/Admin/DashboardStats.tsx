// src/components/Admin/DashboardStats.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Ticket, Theater, Star } from 'lucide-react';
import { AdminStatistics } from '../../types/adminDashboard';

interface DashboardStatsProps {
  statistics: AdminStatistics;
  period: string;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const DashboardStats: React.FC<DashboardStatsProps> = ({ statistics, period }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <motion.div
        className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6"
        variants={cardVariants}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Total Revenue</p>
            <h3 className="text-2xl font-bold text-white">{formatCurrency(statistics.totalRevenue)}</h3>
          </div>
          <DollarSign className="w-8 h-8 text-green-400" />
        </div>
      </motion.div>
      <motion.div
        className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6"
        variants={cardVariants}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Total Bookings</p>
            <h3 className="text-2xl font-bold text-white">{statistics.totalBookings.toLocaleString()}</h3>
          </div>
          <Ticket className="w-8 h-8 text-blue-400" />
        </div>
      </motion.div>
      <motion.div
        className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6"
        variants={cardVariants}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Total Theaters</p>
            <h3 className="text-2xl font-bold text-white">{statistics.totalTheaters}</h3>
            <p className="text-gray-400 text-xs">All Time</p>
          </div>
          <Theater className="w-8 h-8 text-purple-400" />
        </div>
      </motion.div>
      <motion.div
        className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6"
        variants={cardVariants}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Average Rating</p>
            <h3 className="text-2xl font-bold text-white">{statistics.averageRating.toFixed(1)}</h3>
            <p className="text-gray-400 text-xs">All Theaters</p>
          </div>
          <Star className="w-8 h-8 text-yellow-400" />
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardStats;