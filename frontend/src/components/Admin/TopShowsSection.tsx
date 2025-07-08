// src/components/Admin/TopShowsSection.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Play, Clock, Users, Star,  } from 'lucide-react';
import { TopShow } from '../../types/adminDashboard';
import { FaFire } from 'react-icons/fa';

interface TopShowsSectionProps {
  shows: TopShow[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const TopShowsSection: React.FC<TopShowsSectionProps> = ({ shows }) => {
  return (
    <motion.div
      className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    >
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Top Shows</h3>
            <p className="text-gray-400 text-sm">Most popular movies by bookings and revenue</p>
          </div>
          <motion.div
            className="p-2 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-lg"
            whileHover={{ scale: 1.05 }}
          >
            <FaFire className="w-6 h-6 text-red-400" />
          </motion.div>
        </div>
      </div>

      <motion.div
        className="p-6 space-y-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {shows.map((show, index) => (
          <motion.div
            key={show.id.toString()}
            className="relative group"
            variants={cardVariants}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center p-4 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-all duration-300">
              <div className="relative mr-4">
                <div className="flex items-center justify-center w-8 h-8 bg-gray-600 rounded-full text-white font-bold text-sm">
                  {index + 1}
                </div>
                {show.isHot && (
                  <div className="absolute -top-1 -right-1">
                    <FaFire className="w-4 h-4 text-orange-500" />
                  </div>
                )}
              </div>
              <div className="relative w-12 h-16 rounded-lg overflow-hidden mr-4 flex-shrink-0">
                <img
                  src={show.poster}
                  alt={show.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-white font-semibold truncate">{show.title}</h4>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 mr-1" />
                    <span className="text-yellow-400 text-sm font-medium">{show.rating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="flex items-center text-gray-400 text-xs mb-2 space-x-3">
                  <span>{show.genre}</span>
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>{show.duration}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="flex items-center text-gray-400 mb-1">
                      <Users className="w-3 h-3 mr-1" />
                      <span>Bookings</span>
                    </div>
                    <p className="text-blue-400 font-semibold">{show.bookings.toLocaleString()}</p>
                  </div>
                  <div>
                    <div className="flex items-center text-gray-400 mb-1">
                      <span>Revenue</span>
                    </div>
                    <p className="text-green-400 font-semibold">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'INR',
                        minimumFractionDigits: 0,
                      }).format(show.revenue)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="p-4 bg-gray-900/50 border-t border-gray-700">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-400">Showing top 4 shows</span>
          {/*  */}
        </div>
      </div>
    </motion.div>
  );
};

export default TopShowsSection;