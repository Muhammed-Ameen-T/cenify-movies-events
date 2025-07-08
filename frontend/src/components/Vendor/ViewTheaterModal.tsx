import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Theater } from '../../types/theater';

interface ViewTheaterModalProps {
  theater: Theater;
  onClose: () => void;
}

const ViewTheaterModal: React.FC<ViewTheaterModalProps> = ({ theater, onClose }) => {
  // Handle potential missing or invalid data
  const safeCoordinates = theater.location.coordinates?.length === 2 
    ? theater.location.coordinates.join(', ') 
    : 'N/A';
  const safeGallery = theater.gallery?.length > 0 ? theater.gallery : ['/placeholder-image.jpg'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }} // Fixed: Corrected invalid opacity value
      transition={{ duration: 0.2 }} // Optimized: Faster backdrop transition
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50"
      role="dialog"
      aria-labelledby="view-theater-title"
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
            id="view-theater-title"
            className="text-2xl font-semibold text-white tracking-tight"
          >
            {theater.name || 'Unnamed Theater'}
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
                Description
              </h3>
              <p className="text-gray-200 text-sm leading-relaxed mt-2">
                {theater.description || 'No description available'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                Location
              </h3>
              <p className="text-gray-200 text-sm mt-2">
                {theater.location.city || 'Unknown City'}
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Coordinates: {safeCoordinates}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                Facilities
              </h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {theater.facilities && Object.entries(theater.facilities).length > 0 ? (
                  Object.entries(theater.facilities).map(([key, value]) =>
                    value ? (
                      <span
                        key={key}
                        className="px-2 py-1 bg-indigo-600/20 text-indigo-300 rounded-full text-xs font-medium"
                      >
                        {key
                          .replace(/([A-Z])/g, ' $1')
                          .replace(/^./, (str) => str.toUpperCase())}
                      </span>
                    ) : null
                  )
                ) : (
                  <p className="text-gray-400 text-xs">No facilities available</p>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                Gallery
              </h3>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {safeGallery.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Gallery image ${index + 1} for ${theater.name || 'theater'}`}
                    className="w-full h-32 object-cover rounded-lg shadow-md hover:scale-105 transition-transform duration-200"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-image.jpg'; // Fallback image
                    }}
                  />
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                Contact
              </h3>
              <p className="text-gray-200 text-sm mt-2">
                Email: {theater.email || 'N/A'}
              </p>
              <p className="text-gray-200 text-sm mt-1">
                Phone: {theater.phone || 'N/A'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                Vendor
              </h3>
              <p className="text-gray-200 text-sm mt-2">
                Name: {theater.vendorId?.name || 'Unknown Vendor'}
              </p>
              <p className="text-gray-200 text-sm mt-1">
                Email: {theater.vendorId?.email || 'N/A'}
              </p>
              <p className="text-gray-200 text-sm mt-1">
                Phone: {theater.vendorId?.phone || 'N/A'}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-gray-700/50">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
            Metadata
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            <p className="text-gray-200 text-sm">
              Created At:{' '}
              {theater.createdAt
                ? new Date(theater.createdAt).toLocaleString()
                : 'N/A'}
            </p>
            <p className="text-gray-200 text-sm">
              Updated At:{' '}
              {theater.updatedAt
                ? new Date(theater.updatedAt).toLocaleString()
                : 'N/A'}
            </p>
            <p className="text-gray-200 text-sm">
              Rating: {theater.rating != null ? theater.rating : 'N/A'}
            </p>
            <p className="text-gray-200 text-sm">
              Interval Time:{' '}
              {theater.intervalTime != null ? `${theater.intervalTime} minutes` : 'N/A'}
            </p>
          </div>
        </div>
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

export default React.memo(ViewTheaterModal);