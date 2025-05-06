import React from 'react';
import { useSearchParams } from 'react-router-dom';
import TheaterDetailsForm from '../../components/Vendor/TheaterDetailsForm';
import { motion } from 'framer-motion';
import { ToastContainer} from "react-toastify";
import BackButton from '../../components/Buttons/BackButton';

const TheaterDetailsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const vendorId = searchParams.get('vendorId') || 'default-vendor-id';

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-b from-gray-900 to-blue-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ToastContainer/>
      <div className="container mx-auto px-4 py-10">  
        <motion.h1 
          className="text-4xl font-bold text-center text-white mb-4"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Complete Your Theater Profile
        </motion.h1>
        
        <motion.p 
          className="text-gray-300 text-center mb-8 max-w-2xl mx-auto"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Add details about your theater to help customers find you easily and understand what you offer
        </motion.p>
        
        <TheaterDetailsForm vendorId={vendorId} />
      </div>
    </motion.div>
  );
};

export default TheaterDetailsPage;