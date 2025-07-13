// src/components/User/CancelConfirmationModal.tsx
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { BookingService } from '../../services/User/bookingApi';
import { AxiosError } from 'axios';

const modalVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
};

interface CancelConfirmationModalProps {
  bookingId: string | null;
  onClose: () => void;
  onSuccess: () => void;
  cancellationFee?: number;
  refundPercentage?: number;
}

const CancelConfirmationModal: React.FC<CancelConfirmationModalProps> = ({
  bookingId,
  onClose,
  onSuccess,
  cancellationFee = 15,
  refundPercentage = 85,
}) => {
  const [reason, setReason] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const firstFocusableElementRef = useRef<HTMLButtonElement>(null);

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      BookingService.cancelBooking(id, reason),
    onSuccess: () => {
      toast.success('Booking cancelled successfully!');
      onSuccess();
      onClose();
    },
    onError: (error) => {
      let message = 'Failed to cancel booking';

      if (error instanceof AxiosError) {
        message = error.response?.data?.message || error.message || message;
      } else if (error instanceof Error) {
        message = error.message || message;
      }
      toast.error(message);
    },
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
      if (event.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements) {
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
          if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          } else if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    firstFocusableElementRef.current?.focus();
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!bookingId) return null;

  const handleCancel = () => {
    if (!reason.trim()) {
      toast.error('Please provide a cancellation reason');
      return;
    }
    if (reason.length > 500) {
      toast.error('Cancellation reason cannot exceed 500 characters');
      return;
    }
    cancelMutation.mutate({ id: bookingId, reason });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-modal-title"
    >
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        className="bg-gray-900 text-gray-200 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-700"
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          <h3 id="cancel-modal-title" className="text-xl font-bold text-white">
            Cancel Booking
          </h3>
        </div>

        {/* ✅ Replaced problematic <p> block with a valid structure */}
        <div className="text-gray-400 mb-4 text-center text-sm leading-relaxed space-y-2">
          <p>Are you sure you want to cancel this booking?</p>
          <p>
            <span className="font-semibold text-red-500">{cancellationFee}% cancellation fee</span> will be deducted from
            the total amount.
            user will receive a{' '}
            <span className="font-semibold text-green-500">{refundPercentage}% refund</span> to your wallet instantly.
            This action cannot be undone.
          </p>
        </div>

        <div className="mb-6">
          <label htmlFor="cancel-reason" className="block text-sm font-medium text-gray-300 mb-2">
            Reason for Cancellation
          </label>
          <textarea
            id="cancel-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please provide a reason for cancellation"
            className="w-full px-4 py-2 bg-gray-800 text-gray-200 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition duration-200 resize-none"
            rows={4}
            maxLength={500}
            aria-required="true"
          />
          <p className="text-xs text-gray-500 mt-1">{reason.length}/500 characters</p>
        </div>

        <div className="flex justify-center gap-4">
          <motion.button
            ref={firstFocusableElementRef}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onClose}
            className="bg-gray-800 border-2 border-gray-600 text-gray-300 px-6 py-2 rounded-xl font-semibold hover:bg-gray-700"
            aria-label="Keep booking"
          >
            No, Keep Booking
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleCancel}
            disabled={cancelMutation.isPending}
            className="bg-red-500 text-white px-6 py-2 rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50 hover:bg-red-600"
            aria-label="Confirm cancel booking"
          >
            {cancelMutation.isPending ? (
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
