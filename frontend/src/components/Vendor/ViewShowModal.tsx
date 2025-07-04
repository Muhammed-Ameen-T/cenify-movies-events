import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Show } from '../../types/show';

interface ViewShowModalProps {
  show: Show;
  onClose: () => void;
}

const ViewShowModal: React.FC<ViewShowModalProps> = ({ show, onClose }) => {
  return (
    <motion.div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-gray-800 rounded-2xl p-6 max-w-lg w-full mx-4 border border-gray-700/30 shadow-2xl"
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Show Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>
        <div className="space-y-4 text-gray-200">
          <p>
            <strong className="text-gray-400">Movie:</strong> {show.movieId?.name || 'N/A'}
          </p>
          <p>
            <strong className="text-gray-400">Theater:</strong> {show.theaterId?.name || 'N/A'}
          </p>
          <p>
            <strong className="text-gray-400">Screen:</strong> {show.screenId?.name || 'N/A'}
          </p>
          <p>
            <strong className="text-gray-400">Date:</strong>{' '}
            {new Date(show.showDate).toLocaleDateString()}
          </p>
          <p>
            <strong className="text-gray-400">Show Time:</strong>
            <ul className="list-disc ml-6">{new Date(show.startTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                }) || 'N/A'} - {new Date(show.endTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                }) || 'N/A'
              } </ul>
          </p>
          <p>
            <strong className="text-gray-400">Status:</strong>{' '}
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                show.status === 'Running'
                  ? 'bg-green-600/20 text-green-300'
                  : 'bg-red-600/20 text-red-300'
              }`}
            >
              {show.status}
            </span>
          </p>
          <p>
            <strong className="text-gray-400">Movie Duration:</strong>{' '}
            {show.movieId?.duration
              ? `${show.movieId.duration.hours}h ${show.movieId.duration.minutes}m`
              : 'N/A'}
          </p>
          <p>
            <strong className="text-gray-400">Theater Interval:</strong>{' '}
            {show.theaterId?.intervalTime
              ? `${show.theaterId.intervalTime} minutes`
              : 'N/A'}
          </p>
         
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ViewShowModal;