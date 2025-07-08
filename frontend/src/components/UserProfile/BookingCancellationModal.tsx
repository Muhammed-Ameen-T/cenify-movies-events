// src/components/User/CancelConfirmationModal.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { BookingService } from '../../services/User/bookingApi';

const modalVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
};

interface CancelConfirmationModalProps {
  bookingId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

const CancelConfirmationModal: React.FC<CancelConfirmationModalProps> = ({ bookingId, onClose, onSuccess }) => {
  const [reason, setReason] = useState('');

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => 
      BookingService.cancelBooking(id, reason),
    onSuccess: () => {
      toast.success('Booking cancelled successfully!');
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to cancel booking');
    },
  });

  if (!bookingId) return null;

  const handleCancel = () => {
    if (!reason.trim()) {
      toast.error('Please provide a cancellation reason');
      return;
    }
    cancelMutation.mutate({ id: bookingId, reason });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-100 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-modal-title"
    >
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          <h3 id="cancel-modal-title" className="text-xl font-bold text-gray-900">
            Cancel Booking
          </h3>
        </div>
        <p className="text-gray-600 mb-4 text-center">
          Are you sure you want to cancel this booking?
          <br />
          <span className="font-semibold text-red-600">15% cancellation fee</span> will be deducted from the total amount.
          You will receive a <span className="font-semibold text-green-700">85% refund</span> to your wallet instantly.
          This action cannot be undone.
        </p>

        <div className="mb-6">
          <label htmlFor="cancel-reason" className="block text-sm font-medium text-gray-700 mb-2">
            Reason for Cancellation
          </label>
          <textarea
            id="cancel-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please provide a reason for cancellation"
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 resize-none"
            rows={4}
            aria-required="true"
          />
        </div>

        <div className="flex justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onClose}
            className="bg-white border-2 border-gray-200 text-gray-700 px-6 py-2 rounded-xl font-semibold"
            aria-label="Keep booking"
          >
            No, Keep Booking
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleCancel}
            disabled={cancelMutation.isLoading}
            className="bg-red-500 text-white px-6 py-2 rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50"
            aria-label="Confirm cancel booking"
          >
            {cancelMutation.isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <X className="w-4 h-4" />
            )}
            Yes, Cancel
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CancelConfirmationModal;
