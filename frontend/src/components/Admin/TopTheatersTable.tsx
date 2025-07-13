// src/components/Admin/TopTheatersTable.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star, TrendingUp, Crown } from 'lucide-react';
import { TopTheater } from '../../types/adminDashboard';

interface TopTheatersTableProps {
  theaters: TopTheater[];
}

const tableVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};  

const TopTheatersTable: React.FC<TopTheatersTableProps> = ({ theaters }) => {
  console.log("🚀 ~ theaters:", theaters)
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
    return <span className="text-lg font-bold text-gray-400">#{rank}</span>;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <motion.div
      className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Top Performing Theaters</h3>
            <p className="text-gray-400 text-sm">Ranked by revenue and customer satisfaction</p>
          </div>
          <motion.div
            className="p-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg"
            whileHover={{ scale: 1.05 }}
          >
            <TrendingUp className="w-6 h-6 text-yellow-400" />
          </motion.div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <motion.div
          className="min-w-full"
          variants={tableVariants}
          initial="hidden"
          animate="visible"
        >
          {theaters.map((theater) => (
            <motion.div
              key={theater.id.toString()}
              className="flex items-center p-4 border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors"
              variants={rowVariants}
            >
              <div className="flex items-center justify-center w-12 mr-4">
                {getRankIcon(theater.rank)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-semibold truncate">{theater.name}</h4>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      <span className="text-yellow-400 text-sm font-medium">{theater.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center text-gray-400 text-sm mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{theater.location}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Revenue</span>
                    <p className="text-green-400 font-semibold">{formatCurrency(theater.revenue)}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Bookings</span>
                    <p className="text-blue-400 font-semibold">{theater.bookings.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Growth</span>
                    <p className="text-green-400 font-semibold">+{theater.growth.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="p-4 bg-gray-900/50">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-400">Showing top 5 theaters</span>
          {/*  */}
        </div>
      </div>
    </motion.div>
  );
};

export default TopTheatersTable;