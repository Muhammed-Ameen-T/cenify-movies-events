import React from 'react';
import Navbar from '../../components/Admin/Navbar';
import Sidebar from '../../components/Admin/Sidebar';
import DashboardStats from '../../components/Admin/DashboardStats';
import SalesChart from '../../components/Admin/SalesChart';
import DealsTable from '../../components/Admin/DealsTable';
import { motion } from 'framer-motion';

const Dashboard: React.FC = () => {
  const pageVariants = {
    initial: {
      opacity: 0,
    },
    in: {
      opacity: 1,     
      transition: {
        duration: 0.3,
        staggerChildren: 0.1,
      },
    },
    out: {
      opacity: 0,
    },
  };

  const contentVariants = {
    initial: {
      opacity: 0,
      y: 20,
    },
    in: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <motion.div 
      className="flex h-screen bg-gray-900"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
    >
      <Sidebar activePage="dashboard" />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar title="Dashboard" />
        
        <motion.main 
          className="flex-1 overflow-y-auto p-6 scrollbar scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900"
          variants={contentVariants}
        >
          <motion.div 
            className="mb-6 flex justify-between items-center"
            variants={contentVariants}
          >
            <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
            <motion.div 
              className="text-sm text-gray-400"
              whileHover={{ scale: 1.02 }}
            >
              Last updated: Today at 11:23 AM
            </motion.div>
          </motion.div>
          
          <motion.div variants={contentVariants}>
            <DashboardStats />
          </motion.div>
          
          <motion.div 
            className="mt-6"
            variants={contentVariants}
          >
            <SalesChart />
          </motion.div>
          
          <motion.div 
            className="mt-6"
            variants={contentVariants}
          >
            <DealsTable />
          </motion.div>
        </motion.main>
      </div>
    </motion.div>
  );
};

export default Dashboard;