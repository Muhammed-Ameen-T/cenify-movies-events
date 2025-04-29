// components/DashboardCard.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface DashboardCardProps {
  title: string;
  value: string | number;
  color: string;
  icon: React.ReactNode;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, color, icon }) => {
  return (
    <motion.div 
      className={`${color} rounded-xl p-6 shadow-lg`}
      whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-gray-100 font-medium">{title}</h3>
        <div className="w-10 h-10 rounded-lg bg-white bg-opacity-20 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
    </motion.div>
  );
};

export default DashboardCard;
