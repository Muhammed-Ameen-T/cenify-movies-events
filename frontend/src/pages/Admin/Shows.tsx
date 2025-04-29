import React from 'react';
import Navbar from '../../components/Admin/Navbar';
import Sidebar from '../../components/Admin/Sidebar';
import { motion } from 'framer-motion';

const Shows: React.FC = () => {
  const pageVariants = {
    initial: {
      opacity: 0,
    },
    in: {
      opacity: 1,
      transition: {
        duration: 0.3,
      },
    },
    out: {
      opacity: 0,
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
      <Sidebar activePage="shows" />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar title="Shows" />
        
        <main className="flex-1 overflow-y-auto p-6">
          <h1 className="mb-6 text-2xl font-bold text-white">Shows Management</h1>
          
          <div className="bg-gray-800 rounded-xl p-8 flex items-center justify-center h-80 shadow-lg border border-gray-700">
            <p className="text-gray-400 text-lg">Shows management page is under development...</p>
          </div>
        </main>
      </div>
    </motion.div>
  );
};

export default Shows;