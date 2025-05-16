import React from 'react';
import { motion } from 'framer-motion';
import { Star, Ticket, Gift } from 'lucide-react';
import { UserProfile } from '../../types';

interface LoyaltyTabProps {
  user: UserProfile;
}

const LoyaltyTab: React.FC<LoyaltyTabProps> = ({ user }) => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1 
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="bg-white rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Loyalty Points</h2>
        
        <div className="bg-gradient-to-r from-[#FFCC00] to-[#FFBB00] rounded-xl p-6 text-gray-900 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <p className="text-[#9A7A00] text-sm">Total Points</p>
              <div className="flex items-baseline">
                <h3 className="text-4xl font-bold">{user.loyaltyPoints}</h3>
                <span className="ml-2 text-[#9A7A00]">points</span>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <p className="text-[#9A7A00] text-sm text-center md:text-right">Points Expiry</p>
              <p className="font-medium">December 31, 2025</p>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3 text-gray-800">Points History</h3>
          <div className="space-y-3">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-gray-900">Movie Ticket Purchase</h4>
                  <p className="text-sm text-gray-500">Inception 2: Dream Deeper</p>
                  <p className="text-xs text-gray-500">May 10, 2025</p>
                </div>
                <p className="text-green-600 font-medium">+200 pts</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-gray-900">Free Ticket Redemption</h4>
                  <p className="text-sm text-gray-500">Reward Redemption</p>
                  <p className="text-xs text-gray-500">April 28, 2025</p>
                </div>
                <p className="text-red-600 font-medium">-1000 pts</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-gray-900">Concession Purchase</h4>
                  <p className="text-sm text-gray-500">Large Popcorn & Soda</p>
                  <p className="text-xs text-gray-500">April 28, 2025</p>
                </div>
                <p className="text-green-600 font-medium">+50 pts</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-gray-900">Movie Ticket Purchase</h4>
                  <p className="text-sm text-gray-500">Eternal Sunshine (3 tickets)</p>
                  <p className="text-xs text-gray-500">April 15, 2025</p>
                </div>
                <p className="text-green-600 font-medium">+600 pts</p>
              </div>
            </div>
          </div>
          <div className="text-center mt-4">
            <button className="text-[#FFCC00] hover:text-[#FFBB00] font-medium">
              View Full History
            </button>
          </div>
        </div>
        
        <div>
          <h3 className="text-xl font-semibold mb-3 text-gray-800">How to Earn Points</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="bg-[#FFF8E0] w-12 h-12 rounded-full flex items-center justify-center mb-3">
                <Ticket className="w-6 h-6 text-[#FFCC00]" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Movie Tickets</h4>
              <p className="text-sm text-gray-600">Earn 200 points per ticket</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="bg-[#FFF8E0] w-12 h-12 rounded-full flex items-center justify-center mb-3">
                <Gift className="w-6 h-6 text-[#FFCC00]" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Concessions</h4>
              <p className="text-sm text-gray-600">Earn 1 point per $1 spent</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="bg-[#FFF8E0] w-12 h-12 rounded-full flex items-center justify-center mb-3">
                <Star className="w-6 h-6 text-[#FFCC00]" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Special Events</h4>
              <p className="text-sm text-gray-600">Earn bonus points at premieres</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LoyaltyTab;