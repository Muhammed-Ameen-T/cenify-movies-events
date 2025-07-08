import React from 'react';
import { X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning'
}) => {
  if (!isOpen) return null;

  const getColors = () => {
    switch (type) {
      case 'danger':
        return {
          bg: 'bg-red-600',
          hover: 'hover:bg-red-700',
          text: 'text-red-500',
          icon: 'text-red-500'
        };
      case 'info':
        return {
          bg: 'bg-blue-600',
          hover: 'hover:bg-blue-700',
          text: 'text-blue-500',
          icon: 'text-blue-500'
        };
      case 'warning':
      default:
        return {
          bg: 'bg-yellow-600',
          hover: 'hover:bg-yellow-700',
          text: 'text-yellow-500',
          icon: 'text-yellow-500'
        };
    }
  };

  const colors = getColors();

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 25 
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.9,
      y: 20,
      transition: { duration: 0.2 }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop with blur */}
          <motion.div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          <motion.div 
            className="relative w-full max-w-md p-6 mx-auto bg-gray-900 rounded-xl shadow-2xl border border-gray-800"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="absolute top-3 right-3">
              <motion.button
                onClick={onClose}
                className="p-1 text-gray-400 rounded-full hover:bg-gray-800 hover:text-white focus:outline-none"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            <div className="flex items-center mb-5">
              <div className={`p-2 rounded-full ${colors.text} bg-opacity-20 mr-4`}>
                <AlertCircle className={`w-8 h-8 ${colors.icon}`} />
              </div>
              <h3 className="text-xl font-semibold text-white">{title}</h3>
            </div>
            
            <p className="text-gray-300 mb-6">{message}</p>
            
            <div className="flex justify-end space-x-3">
              <motion.button
                onClick={onClose}
                className="px-4 py-2 text-gray-300 bg-gray-800 rounded-lg hover:bg-gray-700"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {cancelText}
              </motion.button>
              
              <motion.button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`px-4 py-2 text-white ${colors.bg} rounded-lg ${colors.hover}`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {confirmText}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationModal;
