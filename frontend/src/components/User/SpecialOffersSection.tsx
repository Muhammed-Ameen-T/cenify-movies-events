import React from 'react';
import { motion } from 'framer-motion';
import { Tag, Ticket } from 'lucide-react';

const SpecialOffersSection: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { 
        delay: custom * 0.2,
        duration: 0.5
      }
    })
  };

  const circleVariants = {
    animate: {
      scale: [1, 1.1, 1],
      rotate: [0, 5, 0],
      transition: {
        duration: 5,
        repeat: Infinity,
        repeatType: "reverse"
      }
    }
  };

  return (
    <motion.section 
      className="py-12 px-4"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto">
        <motion.h2 
          className="text-3xl font-bold text-gray-900 mb-8"
          variants={cardVariants}
          custom={0}
        >
          Special Offers
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <OfferCard 
            custom={1}
            gradient="from-yellow-400 to-yellow-500"
            tag="New Users"
            title="15% OFF on your first booking"
            description="Use code: WELCOME15"
            buttonText="Book Now"
            buttonClass="bg-white text-yellow-600 hover:bg-gray-100"
            icon={<Tag className="w-10 h-10" />}
            circles="bg-yellow-500/30"
          />
          
          <OfferCard 
            custom={2}
            gradient="from-gray-700 to-gray-800"
            tag="Limited Time"
            tagClass="bg-yellow-400 text-gray-800"
            title="Weekend Special"
            description="Buy 2 tickets, get 1 free!"
            buttonText="Learn More"
            buttonClass="bg-yellow-400 text-gray-800 hover:bg-yellow-500"
            icon={<Ticket className="w-10 h-10 text-yellow-400" />}
            circles="bg-yellow-400/15"
          />
        </div>
      </div>
    </motion.section>
  );
};

interface OfferCardProps {
  custom: number;
  gradient: string;
  tag: string;
  tagClass?: string;
  title: string;
  description: string;
  buttonText: string;
  buttonClass: string;
  icon: React.ReactNode;
  circles: string;
}

const OfferCard: React.FC<OfferCardProps> = ({ 
  custom, 
  gradient, 
  tag, 
  tagClass = "bg-white/30", 
  title, 
  description, 
  buttonText, 
  buttonClass,
  icon,
  circles
}) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { 
        delay: custom * 0.2,
        duration: 0.5
      }
    })
  };
  
  return (
    <motion.div 
      className={`bg-gradient-to-r ${gradient} rounded-xl p-6 text-gray-800 flex items-center overflow-hidden relative shadow-md`}
      variants={cardVariants}
      custom={custom}
      whileHover={{ y: -5 }}
    >
      <motion.div 
        className="relative z-10 w-full md:w-2/3"
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        viewport={{ once: true }}
      >
        <div className={`inline-block ${tagClass} px-3 py-1 rounded-full text-sm font-medium mb-4`}>
          {tag}
        </div>
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <p className="mb-6 text-gray-700">{description}</p>
        <motion.button 
          className={`${buttonClass} px-5 py-2 rounded-lg transition-colors font-medium`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {buttonText}
        </motion.button>
      </motion.div>
      
      <div className="hidden md:block absolute right-0 -mr-8">
        <motion.div 
          className={`w-48 h-48 rounded-full ${circles} flex items-center justify-center`}
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          <motion.div 
            className={`w-36 h-36 rounded-full ${circles} flex items-center justify-center`}
            animate={{ 
              scale: [1, 1.15, 1],
              rotate: [0, -5, 0]
            }}
            transition={{ 
              duration: 7,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            <motion.div 
              className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center"
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, 0]
              }}
              transition={{ 
                duration: 5,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              {icon}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SpecialOffersSection;