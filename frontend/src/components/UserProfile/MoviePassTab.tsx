import React from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

const MoviePassTab: React.FC = () => {
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
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Cinema Pass Subscription</h2>
        
        <div className="bg-gradient-to-r from-[#FFCC00] to-[#FFBB00] rounded-xl p-6 text-gray-900 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <p className="text-[#9A7A00] text-sm">Current Plan</p>
              <h3 className="text-2xl font-bold">Premium Pass</h3>
              <p className="text-[#9A7A00] mt-1">Unlimited movies, including IMAX & 3D</p>
            </div>
            <div className="mt-4 md:mt-0 text-center md:text-right">
              <p className="text-[#9A7A00] text-sm">Next Billing Date</p>
              <p className="font-medium">June 10, 2025</p>
              <p className="text-[#9A7A00] text-sm mt-1">$24.99/month</p>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3 text-gray-800">Usage This Month</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-4xl font-bold text-[#FFCC00]">5</h4>
              <p className="text-gray-600">Movies Watched</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-4xl font-bold text-[#FFCC00]">2</h4>
              <p className="text-gray-600">Premium Screenings</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-4xl font-bold text-green-600">$75</h4>
              <p className="text-gray-600">Saved This Month</p>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3 text-gray-800">Subscription Benefits</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Check className="w-5 h-5 text-[#FFCC00]" />
              <p className="text-gray-700">Unlimited standard movie screenings</p>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Check className="w-5 h-5 text-[#FFCC00]" />
              <p className="text-gray-700">Access to IMAX and 3D screenings</p>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Check className="w-5 h-5 text-[#FFCC00]" />
              <p className="text-gray-700">No booking fees</p>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Check className="w-5 h-5 text-[#FFCC00]" />
              <p className="text-gray-700">10% discount on concessions</p>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Check className="w-5 h-5 text-[#FFCC00]" />
              <p className="text-gray-700">Bring a friend at reduced price once per month</p>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-xl font-semibold mb-3 text-gray-800">Available Plans</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div 
              whileHover={{ scale: 1.03 }}
              className="border-2 border-gray-200 rounded-lg p-4"
            >
              <h4 className="font-bold text-gray-900 text-lg mb-2">Basic Pass</h4>
              <p className="text-2xl font-bold text-gray-900 mb-2">$14.99<span className="text-sm font-normal text-gray-500">/month</span></p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center">
                  <Check className="w-4 h-4 text-[#FFCC00] mr-2" />
                  <span className="text-sm text-gray-600">Unlimited standard movies</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-4 h-4 text-[#FFCC00] mr-2" />
                  <span className="text-sm text-gray-600">One booking per day</span>
                </div>
                <div className="flex items-center">
                  <X className="w-4 h-4 text-red-500 mr-2" />
                  <span className="text-sm text-gray-600">No premium screenings</span>
                </div>
              </div>
              <button className="w-full border border-[#FFCC00] text-gray-900 py-2 rounded-lg hover:bg-[#FFF8E0] transition-colors text-sm font-medium">
                Downgrade
              </button>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.03 }}
              className="border-2 border-[#FFCC00] rounded-lg p-4 relative"
            >
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#FFCC00] text-gray-900 text-xs py-1 px-3 rounded-full font-medium">
                Current Plan
              </div>
              <h4 className="font-bold text-gray-900 text-lg mb-2">Premium Pass</h4>
              <p className="text-2xl font-bold text-gray-900 mb-2">$24.99<span className="text-sm font-normal text-gray-500">/month</span></p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center">
                  <Check className="w-4 h-4 text-[#FFCC00] mr-2" />
                  <span className="text-sm text-gray-600">Unlimited standard movies</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-4 h-4 text-[#FFCC00] mr-2" />
                  <span className="text-sm text-gray-600">Unlimited bookings</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-4 h-4 text-[#FFCC00] mr-2" />
                  <span className="text-sm text-gray-600">IMAX & 3D screenings</span>
                </div>
              </div>
              <button className="w-full bg-[#FFCC00] text-gray-900 py-2 rounded-lg opacity-50 cursor-not-allowed text-sm font-medium">
                Current Plan
              </button>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.03 }}
              className="border-2 border-gray-200 rounded-lg p-4"
            >
              <h4 className="font-bold text-gray-900 text-lg mb-2">Family Pass</h4>
              <p className="text-2xl font-bold text-gray-900 mb-2">$39.99<span className="text-sm font-normal text-gray-500">/month</span></p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center">
                  <Check className="w-4 h-4 text-[#FFCC00] mr-2" />
                  <span className="text-sm text-gray-600">Up to 4 people</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-4 h-4 text-[#FFCC00] mr-2" />
                  <span className="text-sm text-gray-600">All premium screenings</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-4 h-4 text-[#FFCC00] mr-2" />
                  <span className="text-sm text-gray-600">20% concession discount</span>
                </div>
              </div>
              <button className="w-full border border-[#FFCC00] text-gray-900 py-2 rounded-lg hover:bg-[#FFF8E0] transition-colors text-sm font-medium">
                Upgrade
              </button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MoviePassTab;