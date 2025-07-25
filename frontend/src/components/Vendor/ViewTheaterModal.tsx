import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, X, MapPin, Mail, Phone, User, Star, Clock } from 'lucide-react';
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
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-labelledby="view-theater-title"
      aria-modal="true"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="bg-gray-900 rounded-3xl w-full max-w-6xl max-h-[85vh] overflow-hidden shadow-2xl border border-gray-800/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800/50 bg-gray-900/50 backdrop-blur-sm">
          <div>
            <h2
              id="view-theater-title"
              className="text-2xl font-bold text-white tracking-tight"
            >
              {theater.name || 'Unnamed Theater'}
            </h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {theater.location.city || 'Unknown City'}
              </div>
              {theater.rating != null && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  {theater.rating}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-all duration-200"
            aria-label="Close view modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(85vh-88px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
            {/* Left Column - Images */}
            <div className="lg:col-span-1 p-6 bg-gray-900/30">
              <div className="space-y-4">
                {/* Certificate Image */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Certificate
                  </h3>
                  {safeGallery[0] && (
                    <div className="relative group">
                      <img
                        src={safeGallery[0]}
                        alt={`Certificate for ${theater.name || 'theater'}`}
                        className="w-full h-48 object-cover rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-image.jpg';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  )}
                </div>

                {/* Theater Gallery */}
                {safeGallery.length > 1 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      Theater Gallery
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {safeGallery
                        .filter((_, index) => index !== 0)
                        .map((url, index) => (
                          <div key={index + 1} className="relative group">
                            <img
                              src={url}
                              alt={`Gallery image ${index + 2} for ${theater.name || 'theater'}`}
                              className="w-full h-28 object-cover rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300"
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.src = '/placeholder-image.jpg';
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Middle Column - Details */}
            <div className="lg:col-span-2 p-6">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 h-full">
                {/* Left side of details */}
                <div className="space-y-6">
                  {/* Description */}
                  <div className="bg-gray-800/30 rounded-2xl p-5">
                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
                      Description
                    </h3>
                    <p className="text-gray-200 text-sm leading-relaxed">
                      {theater.description || 'No description available'}
                    </p>
                  </div>

                  {/* Location & Directions */}
                  <div className="bg-gray-800/30 rounded-2xl p-5">
                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
                      Location
                    </h3>
                    <div className="space-y-3">
                      <p className="text-gray-200 text-sm font-medium">
                        {theater.location.city || 'Unknown City'}
                      </p>
                      <p className="text-gray-400 text-xs">
                        Coordinates: {safeCoordinates}
                      </p>
                      <button
                        onClick={() =>
                          window.open(
                            `https://www.google.com/maps/dir/?api=1&destination=${theater.location.coordinates[0]},${theater.location.coordinates[1]}`,
                            '_blank'
                          )
                        }
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm shadow-lg hover:shadow-xl"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Get Directions
                      </button>
                    </div>
                  </div>

                  {/* Facilities */}
                  <div className="bg-gray-800/30 rounded-2xl p-5">
                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
                      Facilities
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {theater.facilities && Object.entries(theater.facilities).length > 0 ? (
                        Object.entries(theater.facilities).map(([key, value]) =>
                          value ? (
                            <span
                              key={key}
                              className="px-3 py-1.5 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 text-indigo-300 rounded-full text-xs font-medium border border-indigo-600/20"
                            >
                              {key
                                .replace(/([A-Z])/g, ' $1')
                                .replace(/^./, (str) => str.toUpperCase())}
                            </span>
                          ) : null
                        )
                      ) : (
                        <p className="text-gray-400 text-sm">No facilities available</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side of details */}
                <div className="space-y-6">
                  {/* Contact Information */}
                  <div className="bg-gray-800/30 rounded-2xl p-5">
                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
                      Contact Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-200 text-sm">
                          {theater.email || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-200 text-sm">
                          {theater.phone || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Vendor Information */}
                  <div className="bg-gray-800/30 rounded-2xl p-5">
                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
                      Vendor Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-200 text-sm">
                          {theater.vendorId?.name || 'Unknown Vendor'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-200 text-sm">
                          {theater.vendorId?.email || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-200 text-sm">
                          {theater.vendorId?.phone || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="bg-gray-800/30 rounded-2xl p-5">
                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
                      Additional Details
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">Rating:</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-gray-200 text-sm">
                            {theater.rating != null ? theater.rating : 'N/A'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">Interval Time:</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-200 text-sm">
                            {theater.intervalTime != null ? `${theater.intervalTime} min` : 'N/A'}
                          </span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-gray-700/50">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Created:</span>
                          <span className="text-gray-400">
                            {theater.createdAt
                              ? new Date(theater.createdAt).toLocaleDateString()
                              : 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs mt-1">
                          <span className="text-gray-500">Updated:</span>
                          <span className="text-gray-400">
                            {theater.updatedAt
                              ? new Date(theater.updatedAt).toLocaleDateString()
                              : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-800/50 bg-gray-900/30">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl transition-all duration-200 text-sm"
            aria-label="Close view modal"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default React.memo(ViewTheaterModal);