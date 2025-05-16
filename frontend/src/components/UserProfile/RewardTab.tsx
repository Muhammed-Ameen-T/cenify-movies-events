import React from 'react';
import { motion } from 'framer-motion';
import { Star, Ticket, Gift, Film, Check } from 'lucide-react';

const RewardsTab: React.FC = () => {
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
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Rewards Program</h2>
        <div className="mb-6">
          <div className="bg-gradient-to-r from-[#FFCC00] to-[#FFBB00] rounded-lg p-6 text-gray-900">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[#9A7A00]">Current Tier</p>
                <h3 className="text-2xl font-bold">Gold Member</h3>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <Star className="w-8 h-8 text-[#FFEE99]" fill="currentColor" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-[#9A7A00]">Progress to Platinum</p>
              <div className="w-full bg-white/30 rounded-full h-2.5 mt-2">
                <div className="bg-white h-2.5 rounded-full" style={{ width: '70%' }}></div>
              </div>
              <p className="text-right text-xs mt-1 text-[#9A7A00]">3500 / 5000 points</p>
            </div>
          </div>
        </div>
        
        <h3 className="text-xl font-semibold mb-3 text-gray-800">Available Perks</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <motion.div 
            whileHover={{ scale: 1.03 }}
            className="border border-gray-200 rounded-lg p-4 bg-white"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-[#FFF8E0] p-2 rounded-full">
                <Ticket className="w-5 h-5 text-[#FFCC00]" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Free Ticket</h4>
                <p className="text-sm text-gray-500">Redeem for any standard screening</p>
              </div>
            </div>
            <button className="mt-3 w-full bg-[#FFCC00] hover:bg-[#FFBB00] text-gray-900 py-2 rounded-lg transition-colors text-sm font-medium">
              Redeem 1000 Points
            </button>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.03 }}
            className="border border-gray-200 rounded-lg p-4 bg-white"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-[#FFF8E0] p-2 rounded-full">
                <Gift className="w-5 h-5 text-[#FFCC00]" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Popcorn & Drink</h4>
                <p className="text-sm text-gray-500">Medium combo voucher</p>
              </div>
            </div>
            <button className="mt-3 w-full bg-[#FFCC00] hover:bg-[#FFBB00] text-gray-900 py-2 rounded-lg transition-colors text-sm font-medium">
              Redeem 500 Points
            </button>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.03 }}
            className="border border-gray-200 rounded-lg p-4 bg-white"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-[#FFF8E0] p-2 rounded-full">
                <Star className="w-5 h-5 text-[#FFCC00]" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">VIP Upgrade</h4>
                <p className="text-sm text-gray-500">Premium seating for one show</p>
              </div>
            </div>
            <button className="mt-3 w-full bg-[#FFCC00] hover:bg-[#FFBB00] text-gray-900 py-2 rounded-lg transition-colors text-sm font-medium">
              Redeem 750 Points
            </button>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.03 }}
            className="border border-gray-200 rounded-lg p-4 bg-white"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-[#FFF8E0] p-2 rounded-full">
                <Film className="w-5 h-5 text-[#FFCC00]" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Movie Premiere</h4>
                <p className="text-sm text-gray-500">Access to exclusive premieres</p>
              </div>
            </div>
            <button className="mt-3 w-full bg-[#FFCC00] hover:bg-[#FFBB00] text-gray-900 py-2 rounded-lg transition-colors text-sm font-medium">
              Redeem 2000 Points
            </button>
          </motion.div>
        </div>
        
        <h3 className="text-xl font-semibold mb-3 text-gray-800">Membership Benefits</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Check className="w-5 h-5 text-[#FFCC00]" />
            <p className="text-gray-700">10% discount on all concessions</p>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Check className="w-5 h-5 text-[#FFCC00]" />
            <p className="text-gray-700">Priority booking for new releases</p>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Check className="w-5 h-5 text-[#FFCC00]" />
            <p className="text-gray-700">Earn double points on Tuesdays</p>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Check className="w-5 h-5 text-[#FFCC00]" />
            <p className="text-gray-700">Free birthday screening</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default RewardsTab;