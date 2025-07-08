import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Screen } from '../../types/screen';

interface ViewScreenModalProps {
  screen: Screen;
  onClose: () => void;
}

const ViewScreenModal: React.FC<ViewScreenModalProps> = ({ screen, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50"
      role="dialog"
      aria-labelledby="view-screen-title"
      aria-modal="true"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="bg-gray-900/95 rounded-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-700/30"
      >
        <div className="flex justify-between items-center mb-6">
          <h2
            id="view-screen-title"
            className="text-2xl font-semibold text-white tracking-tight"
          >
            {screen.name || 'Unnamed Screen'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors duration-200"
            aria-label="Close view modal"
          >
            <X size={24} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                Theater
              </h3>
              <p className="text-gray-200 text-sm mt-2">
                {screen.theaterId?.name || 'N/A'}
              </p>
              <p className="text-gray-400 text-xs mt-1">
                City: {screen.theaterId?.location?.city || 'N/A'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                Seat Layout
              </h3>
              <p className="text-gray-200 text-sm mt-2">
                {screen.seatLayoutId?.layoutName || 'N/A'}
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Capacity: {screen.seatLayoutId?.capacity || 'N/A'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                Amenities
              </h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {Object.entries(screen.amenities)
                  .filter(([key, value]) => value) // Filter only true amenities
                  .map(([amenity]) => (
                    <span
                      key={amenity}
                      className="px-2 py-1 bg-indigo-600/20 text-indigo-300 rounded-full text-xs font-medium"
                    >
                      {amenity}
                    </span>
                  ))}
                {Object.values(screen.amenities).every(value => !value) && (
                  <p className="text-gray-400 text-xs">No amenities available</p>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                Theater Image
              </h3>
              <img
                src={screen.theaterId?.gallery?.[0] || '/placeholder-image.jpg'}
                alt={`Theater image for ${screen.theaterId?.name || 'theater'}`}
                className="w-full h-48 object-cover rounded-lg shadow-md mt-2"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-image.jpg';
                }}
              />
            </div>
          </div>
        </div>
        {/* <div className="mt-6 pt-6 border-t border-gray-700/50">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
            Metadata
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            <p className="text-gray-200 text-sm">
              Created At:{' '}
              {screen.createdAt
                ? new Date(screen.createdAt).toLocaleString()
                : 'N/A'}
            </p>
            <p className="text-gray-200 text-sm">
              Updated At:{' '}
              {screen.updatedAt
                ? new Date(screen.updatedAt).toLocaleString()
                : 'N/A'}
            </p>
          </div>
        </div> */}
        <div className="mt-8 flex justify-end">
          <Button
            variant="secondary"
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
            onClick={onClose}
            aria-label="Close view modal"
          >
            Close
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default React.memo(ViewScreenModal);