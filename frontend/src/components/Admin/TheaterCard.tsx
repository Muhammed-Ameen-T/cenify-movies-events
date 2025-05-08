// components/Admin/TheaterCard.tsx
import React, { useState } from 'react';
import { Star, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import ConfirmationModal from './ConfirmationModal';

interface TheaterCardProps {
  id: string;
  name: string;
  location: string;
  features: string[];
  rating: number;
  reviewCount: number;
  image: string;
  status: string;
  onView: (id: string) => void;
  onBlock?: (id: string) => void;
  onAccept?: (id: string) => void;    
  onUnblock?: (id: string) => void;
}

const TheaterCard: React.FC<TheaterCardProps> = ({
  id,
  name,
  location,
  features,
  rating,
  reviewCount,
  image,
  status,
  onView,
  onBlock,
  onAccept,
  onUnblock,
}) => {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmType, setConfirmType] = useState<'warning' | 'danger' | 'info'>('warning');
  const [confirmText, setConfirmText] = useState('Confirm');
  const [cancelText, setCancelText] = useState('Cancel');

  const statusMapping: Record<string, { text: string; bgColor: string }> = {
    verified: { text: 'Verified', bgColor: 'bg-green-600' },
    verifying: { text: 'Verifying', bgColor: 'bg-blue-600' },
    pending: { text: 'Pending', bgColor: 'bg-blue-600' },
    blocked: { text: 'Blocked', bgColor: 'bg-red-600' },
  };

  const badge = statusMapping[status] || { text: status, bgColor: 'bg-gray-600' };

  const openConfirmModal = (
    action: () => void,
    title: string,
    message: string,
    type: 'warning' | 'danger' | 'info',
    confirmBtnText: string,
  ) => {
    setConfirmAction(() => action);
    setConfirmTitle(title);
    setConfirmMessage(message);
    setConfirmType(type);
    setConfirmText(confirmBtnText);
    setIsConfirmModalOpen(true);
  };

  const handleBlock = () => {
    if (onBlock) {
      openConfirmModal(
        () => onBlock(id),
        'Block Theater',
        `Are you sure you want to block ${name}? This will restrict its visibility.`,
        'danger',
        'Block',
      );
    }
  };

  const handleUnblock = () => {
    if (onUnblock) {
      openConfirmModal(
        () => onUnblock(id),
        'Unblock Theater',
        `Are you sure you want to unblock ${name}? This will restore its visibility.`,
        'info',
        'Unblock',
      );
    }
  };

  const handleAccept = () => {
    if (onAccept) {
      openConfirmModal(
        () => onAccept(id),
        'Accept Theater Request',
        `Are you sure you want to accept ${name}'s request? This will verify the theater.`,
        'info',
        'Accept',
      );
    }
  };

  return (
    <>
      <motion.div
        className="overflow-hidden bg-gray-800 rounded-xl shadow-lg border border-gray-700 flex flex-col"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
      >
        <div className="relative h-64 bg-gray-700">
          <img
            src={
              image ||
              'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=600'
            }
            alt={name}
            className="object-cover w-full h-full hover:scale-110 transition-transform duration-700"
          />
          <div
            className={`absolute top-2 right-2 ${badge.bgColor} text-white text-xs font-medium px-2 py-1 rounded-full`}
          >
            {badge.text}
          </div>
        </div>

        <div className="p-5 flex-grow">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-white">{name}</h3>
            {status === 'verified' && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0C5.372 0 0 5.372 0 12c0 6.627 5.372 12 12 12s12-5.373 12-12C24 5.372 18.627 0 12 0zm-2 17.586l-5.293-5.293 1.414-1.414L10 14.758l7.293-7.293 1.414 1.414L10 17.586z" />
              </svg>
            )}
          </div>
          <p className="text-sm text-gray-400">{location}</p>

          <div className="flex flex-wrap gap-2 mt-3">
            {features.map((feature, index) => (
              <motion.span
                key={index}
                className="px-2 py-1 text-xs font-medium text-blue-300 bg-blue-900 bg-opacity-30 rounded-full"
                whileHover={{ scale: 1.05 }}
              >
                {feature}
              </motion.span>
            ))}
          </div>

          <div className="flex items-center mt-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'
                }`}
              />
            ))}
            <span className="ml-2 text-sm text-gray-400">({reviewCount})</span>
          </div>
        </div>

        <div className="flex border-t border-gray-700">
          {(status === 'pending' || status === 'verifying') && onAccept && (
            <motion.button
              onClick={handleAccept}
              className="flex-1 px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Verify
            </motion.button>
          )}
          {status === 'blocked' && onUnblock && (
            <motion.button
              onClick={handleUnblock}
              className="flex-1 px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Unblock
            </motion.button>
          )}
          {status !== 'blocked' && onBlock && (
            <motion.button
              onClick={handleBlock}
              className="flex-1 px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Block
            </motion.button>
          )}
          <motion.button
            onClick={() => onView(id)}
            className="flex items-center justify-center flex-1 px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Eye className="w-4 h-4 mr-2" />
            View
          </motion.button>
        </div>
      </motion.div>

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={() => confirmAction && confirmAction()}
        title={confirmTitle}
        message={confirmMessage}
        confirmText={confirmText}
        cancelText={cancelText}
        type={confirmType}
      />
    </>
  );
};

export default TheaterCard;