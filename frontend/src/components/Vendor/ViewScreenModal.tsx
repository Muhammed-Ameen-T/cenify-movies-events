import React from 'react';
import { motion } from 'framer-motion';
import { X, MapPin, Users, Monitor, Star, Phone, Award, Image as ImageIcon } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Screen } from '../../types/screen';

interface ViewScreenModalProps {
  screen: Screen;
  onClose: () => void;
}

const ViewScreenModal: React.FC<ViewScreenModalProps> = ({ screen, onClose }) => {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getAmenityLabel = (amenity: string) => {
    switch (amenity) {
      case 'is4K':
        return '4K Ultra HD';
      case 'is3D':
        return '3D Experience';
      case 'isDolby':
        return 'Dolby Atmos';
      default:
        return amenity;
    }
  };

  const getFacilityLabel = (facility: string) => {
    switch (facility) {
      case 'foodCourt':
        return 'Food Court';
      case 'lounges':
        return 'Lounges';
      case 'mTicket':
        return 'Mobile Tickets';
      case 'parking':
        return 'Parking';
      case 'freeCancellation':
        return 'Free Cancellation';
      default:
        return facility.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    }
  };

  const activeAmenities = Object.entries(screen.amenities || {})
    .filter(([_, value]) => value)
    .map(([key, _]) => key);

  const activeFacilities = Object.entries(screen.theaterId?.facilities || {})
    .filter(([_, value]) => value)
    .map(([key, _]) => key);

  const certificateImage = screen.theaterId?.gallery?.[0];
  const galleryImages = screen.theaterId?.gallery?.slice(1) || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-labelledby="view-screen-title"
      aria-modal="true"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-6xl h-[85vh] overflow-hidden border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative">
          <div className="h-20 bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-between px-6">
            <div className="text-white">
              <h2
                id="view-screen-title"
                className="text-xl font-bold"
              >
                {screen.name || 'Unnamed Screen'}
              </h2>
              <div className="flex items-center text-indigo-100 text-sm">
                <MapPin className="w-3 h-3 mr-1" />
                <span>{screen.theaterId?.name || 'Unknown Theater'}</span>
                <span className="mx-2">•</span>
                <span>{screen.theaterId?.location?.city || 'Unknown City'}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors duration-200 p-2 rounded-full hover:bg-white/10"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto h-[calc(85vh-8rem)]">
          <div className="grid grid-cols-12 gap-6 h-full">
            {/* Left Column - Theater Info */}
            <div className="col-span-4 space-y-4">
              {/* Theater Details Card */}
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-white flex items-center">
                    <Monitor className="w-4 h-4 mr-2 text-indigo-400" />
                    Theater Details
                  </h3>
                  {screen.theaterId?.rating > 0 && (
                    <div className="flex items-center text-sm text-gray-300">
                      <Star className="w-4 h-4 mr-1 text-yellow-500 fill-current" />
                      {screen.theaterId.rating}
                    </div>
                  )}
                </div>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-400">Contact:</span>
                    <p className="font-medium text-gray-200 flex items-center mt-1">
                      <Phone className="w-3 h-3 mr-1" />
                      {screen.theaterId?.phone || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">Email:</span>
                    <p className="font-medium text-gray-200 mt-1">
                      {screen.theaterId?.email || 'N/A'}
                    </p>
                  </div>
                  {screen.theaterId?.description && (
                    <div>
                      <span className="text-gray-400">Description:</span>
                      <p className="text-gray-300 mt-1 text-xs leading-relaxed">
                        {screen.theaterId.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Screen Specifications */}
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-700/30">
                  <div className="flex items-center mb-2">
                    <Users className="w-4 h-4 mr-2 text-blue-400" />
                    <h4 className="font-semibold text-white text-sm">Capacity</h4>
                  </div>
                  <p className="text-xl font-bold text-blue-400">
                    {screen.seatLayoutId?.capacity || 'N/A'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {screen.seatLayoutId?.rowCount}×{screen.seatLayoutId?.columnCount} layout
                  </p>
                </div>

                <div className="bg-green-900/30 rounded-lg p-4 border border-green-700/30">
                  <h4 className="font-semibold text-white mb-2 text-sm">Seat Pricing</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Regular:</span>
                      <span className="font-medium text-green-400">₹{screen.seatLayoutId?.seatPrice?.regular || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Premium:</span>
                      <span className="font-medium text-green-400">₹{screen.seatLayoutId?.seatPrice?.premium || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">VIP:</span>
                      <span className="font-medium text-green-400">₹{screen.seatLayoutId?.seatPrice?.vip || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              {activeAmenities.length > 0 && (
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <h4 className="font-semibold text-white mb-3 text-sm">Screen Features</h4>
                  <div className="flex flex-wrap gap-2">
                    {activeAmenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                      >
                        {getAmenityLabel(amenity)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Theater Facilities */}
              {activeFacilities.length > 0 && (
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <h4 className="font-semibold text-white mb-3 text-sm">Theater Facilities</h4>
                  <div className="flex flex-wrap gap-2">
                    {activeFacilities.map((facility) => (
                      <span
                        key={facility}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-300 border border-gray-600"
                      >
                        {getFacilityLabel(facility)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Info */}
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h4 className="font-semibold text-white mb-3 text-sm">Additional Information</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Layout Name:</span>
                    <span className="text-gray-200">{screen.seatLayoutId?.layoutName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Interval Time:</span>
                    <span className="text-gray-200">{screen.theaterId?.intervalTime || 'N/A'} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className="text-gray-200 capitalize">{screen.theaterId?.status || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Screens:</span>
                    <span className="text-gray-200">{screen.theaterId?.screens?.length || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Images */}
            <div className="col-span-8 space-y-4">
              {/* Theater Certificate */}
              {certificateImage && (
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <h4 className="font-semibold text-white mb-3 text-sm flex items-center">
                    <Award className="w-4 h-4 mr-2 text-yellow-500" />
                    Theater Certificate
                  </h4>
                  <div className="relative">
                    <img
                      src={certificateImage.trim()}
                      alt={`${screen.theaterId?.name} Certificate`}
                      className="w-full h-56 object-cover rounded-lg shadow-lg border border-gray-600"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Theater Gallery */}
              {galleryImages.length > 0 && (
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <h4 className="font-semibold text-white mb-3 text-sm flex items-center">
                    <ImageIcon className="w-4 h-4 mr-2 text-purple-500" />
                    Theater Gallery
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    {galleryImages.slice(0, 6).map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image.trim()}
                          alt={`${screen.theaterId?.name} - Gallery ${index + 1}`}
                          className="w-full h-36 object-cover rounded-lg shadow-md border border-gray-600 group-hover:border-indigo-500 transition-colors duration-200"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-colors duration-200" />
                      </div>
                    ))}
                  </div>
                  {galleryImages.length > 6 && (
                    <p className="text-gray-400 text-xs mt-2 text-center">
                      +{galleryImages.length - 6} more images
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        {/* <div className="border-t border-gray-700 px-6 py-1 bg-gray-800/50">
          <div className="flex justify-end">
            <Button
              variant="secondary"
              onClick={onClose}
              className="px-2 py-0 bg-gray-700 hover:bg-gray-600 text-white border border-gray-600 rounded-lg transition-colors duration-200"
            >
              Close
            </Button>
          </div>
        </div> */}
      </motion.div>
    </motion.div>
  );
};

export default React.memo(ViewScreenModal);