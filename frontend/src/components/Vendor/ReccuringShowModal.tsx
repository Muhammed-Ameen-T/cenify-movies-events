import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Repeat } from 'lucide-react';
import Button from '../ui/Button';
import { Show } from '../../types/show';
import { toast } from 'react-toastify';

interface CreateRecurringShowModalProps {
  show: Show;
  onClose: () => void;
  onConfirm: (startDate: string, endDate: string) => void;
}

const CreateRecurringShowModal: React.FC<CreateRecurringShowModalProps> = ({
  show,
  onClose,
  onConfirm,
}) => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(() => {
    if (!startDate || !endDate) {
      setError('Both start date and end date are required.');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      setError('Start date cannot be in the past.');
      return;
    }

    if (end < start) {
      setError('End date cannot be before start date.');
      return;
    }

    setError(null);
    onConfirm(startDate, endDate);
  }, [startDate, endDate, onConfirm]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-gray-900/90 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6 w-full max-w-md shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Repeat className="mr-2 text-purple-400" size={20} />
              Create Recurring Show
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-300 transition-colors"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-400 mb-2">
              Create recurring shows for "{show.movieId?.name || 'this show'}" from:
            </p>
            <div className="space-y-4">
              <div className="relative">
                <label className="text-sm font-medium text-gray-300 mb-1 block">
                  Start Date
                </label>
                <div className="relative">
                  <Calendar
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                    aria-label="Select start date for recurring shows"
                  />
                </div>
              </div>
              <div className="relative">
                <label className="text-sm font-medium text-gray-300 mb-1 block">
                  End Date
                </label>
                <div className="relative">
                  <Calendar
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                    aria-label="Select end date for recurring shows"
                  />
                </div>
              </div>
            </div>
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 text-sm mt-2"
              >
                {error}
              </motion.p>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={onClose}
              className="bg-gray-700 text-gray-300 hover:bg-gray-600"
              aria-label="Cancel recurring show creation"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              aria-label="Save recurring shows"
            >
              Save
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreateRecurringShowModal;