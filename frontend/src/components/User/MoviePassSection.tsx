import React from 'react';
import { motion } from 'framer-motion';
import { Film } from 'lucide-react';

const MoviePassSection: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const benefitVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (custom: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: custom * 0.1,
        duration: 0.4
      }
    })
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.3,
        duration: 0.5
      }
    }
  };

  const benefits = [
    "Save 5% on all movie tickets",
    "Priority booking for premieres",
    "Special concession discounts",
    "Monthly free popcorn"
  ];

  return (
    <motion.section 
      className="py-16 px-4 bg-gray-900 text-white"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <motion.div 
            className="md:w-1/2 mb-10 md:mb-0"
            variants={itemVariants}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Purchase Movie Pass</h2>
            <p className="text-gray-300 mb-8 text-lg">
              Get 5% off on every movie ticket booking with our exclusive Movie Pass. 
              Enjoy unlimited benefits all year round.
            </p>
            
            <ul className="mb-8 space-y-4">
              {benefits.map((benefit, index) => (
                <motion.li 
                  key={index} 
                  className="flex items-start"
                  custom={index}
                  variants={benefitVariants}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 + (index * 0.1), duration: 0.5, type: "spring" }}
                    className="w-5 h-5 rounded-full bg-yellow-400 text-gray-800 flex items-center justify-center mr-3 mt-0.5"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                  <span>{benefit}</span>
                </motion.li>
              ))}
            </ul>
            
            <div className="flex flex-wrap gap-4">
              <motion.button 
                className="bg-yellow-400 text-gray-800 hover:bg-yellow-500 font-medium py-3 px-6 rounded-lg transition-colors"
                whileHover={{ scale: 1.05, backgroundColor: "#EAB308" }}
                whileTap={{ scale: 0.95 }}
              >
                Get Movie Pass
              </motion.button>
              <motion.button 
                className="bg-transparent border border-yellow-400 text-yellow-400 hover:bg-yellow-400/10 font-medium py-3 px-6 rounded-lg transition-colors"
                whileHover={{ scale: 1.05, backgroundColor: "rgba(250, 204, 21, 0.1)" }}
                whileTap={{ scale: 0.95 }}
              >
                Learn More
              </motion.button>
            </div>
          </motion.div>
          
          <motion.div 
            className="md:w-2/5"
            variants={cardVariants}
          >
            <motion.div 
              className="bg-gray-800 p-6 rounded-xl shadow-lg relative overflow-hidden"
              whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)" }}
            >
              <motion.div 
                className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/20 rounded-full -mr-16 -mt-16"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, 0]
                }}
                transition={{ 
                  duration: 8,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />
              <motion.div 
                className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-400/20 rounded-full -ml-12 -mb-12"
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, -5, 0]
                }}
                transition={{ 
                  duration: 6,
                  delay: 1,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />
              
              <div className="relative">
                <div className="flex items-center mb-6">
                  <Film className="w-6 h-6 mr-2 text-yellow-400" />
                  <h3 className="text-xl font-bold">Theater Premium Pass</h3>
                </div>
                
                <div className="mb-6">
                  <div className="text-sm text-gray-400 mb-1">Annual membership</div>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold">₹999</span>
                    <span className="text-gray-400 ml-2">/year</span>
                  </div>
                </div>
                
                <motion.button 
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                  whileHover={{ scale: 1.03, backgroundColor: "#EAB308" }}
                  whileTap={{ scale: 0.97 }}
                >
                  Purchase Now
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </div>  
      </div>
    </motion.section>
  );
};

export default MoviePassSection;