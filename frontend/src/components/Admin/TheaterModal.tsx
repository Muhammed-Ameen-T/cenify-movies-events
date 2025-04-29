// components/Admin/TheaterModal.tsx
import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, MapPin, Phone, Mail, Globe, Clock, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import { Theater } from '../../types/theater';

interface TheaterModalProps {
  isOpen: boolean;
  onClose: () => void;
  theater: Theater | null;
}

const googleMapsApiKey: string = import.meta.env.REACT_APP_GOOGLE_MAPS_API_KEY ; 

const TheaterModal: React.FC<TheaterModalProps> = ({ isOpen, onClose, theater }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey,
  });

  if (!isOpen || !theater) return null;

  // Default coordinates for Kochi if none provided
  const coordinates = theater.coordinates
    ? { lat: theater.coordinates[0], lng: theater.coordinates[1] }
    : { lat: 10.0159, lng: 76.3419 };

  const nextImage = () => {
    setActiveImageIndex((prevIndex) => (prevIndex + 1) % (theater.images.length || 1));
  };

  const prevImage = () => {
    setActiveImageIndex((prevIndex) =>
      prevIndex === 0 ? (theater.images.length || 1) - 1 : prevIndex - 1,
    );
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: { duration: 0.2 },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
          {/* Backdrop with blur */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="relative w-full max-w-5xl mx-auto bg-gray-900/90 backdrop-blur-lg rounded-xl shadow-2xl max-h-[90vh] flex flex-col border border-gray-800 overflow-hidden"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h3 className="text-xl font-semibold text-white">{theater.name}</h3>
              <motion.button
                onClick={onClose}
                className="p-1 text-gray-400 rounded-full hover:bg-gray-700 hover:text-white focus:outline-none"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="relative h-96">
                <img
                  src={
                    theater.images[activeImageIndex] ||
                    'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=1000'
                  }
                  alt={`${theater.name} - Image ${activeImageIndex + 1}`}
                  className="object-cover w-full h-full"
                />

                <motion.button
                  onClick={prevImage}
                  className="absolute flex items-center justify-center w-10 h-10 text-white bg-black bg-opacity-40 backdrop-blur-sm rounded-full left-4 top-1/2 transform -translate-y-1/2 hover:bg-opacity-60"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ChevronLeft className="w-6 h-6" />
                </motion.button>

                <motion.button
                  onClick={nextImage}
                  className="absolute flex items-center justify-center w-10 h-10 text-white bg-black bg-opacity-40 backdrop-blur-sm rounded-full right-4 top-1/2 transform -translate-y-1/2 hover:bg-opacity-60"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ChevronRight className="w-6 h-6" />
                </motion.button>

                <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                  {(theater.images || []).map((_, index) => (
                    <motion.button
                      key={index}
                      onClick={() => setActiveImageIndex(index)}
                      className={`w-3 h-3 rounded-full ${
                        index === activeImageIndex ? 'bg-white' : 'bg-gray-400'
                      }`}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.8 }}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-3">
                <div className="col-span-2 space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-white">Description</h4>
                    <p className="mt-2 text-gray-300 leading-relaxed">
                      {theater.description || 'No description available.'}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-white">Features</h4>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {theater.features.map((feature, index) => (
                        <motion.span
                          key={index}
                          className="px-3 py-1 text-sm font-medium text-blue-300 bg-blue-900 bg-opacity-30 rounded-full"
                          whileHover={{ scale: 1.05, y: -2 }}
                        >
                          {feature}
                        </motion.span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-white">Screens</h4>
                    <div className="grid grid-cols-1 gap-4 mt-3 sm:grid-cols-2">
                      {(theater.screens || []).map((screen, index) => (
                        <motion.div
                          key={index}
                          className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors duration-300"
                          whileHover={{ y: -5 }}
                        >
                          <h5 className="font-medium text-white">{screen.name}</h5>
                          <p className="text-sm text-gray-400">
                            Capacity: {screen.capacity} seats
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {screen.features.map((feature, fIndex) => (
                              <span
                                key={fIndex}
                                className="px-2 py-0.5 text-xs font-medium text-green-300 bg-green-900 bg-opacity-30 rounded"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                      {!theater.screens?.length && (
                        <p className="text-gray-400">No screen information available.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <motion.div
                    className="p-4 bg-gray-800 rounded-lg border border-gray-700"
                    whileHover={{ y: -5 }}
                  >
                    <h4 className="text-lg font-semibold text-white">Contact Information</h4>
                    <ul className="mt-3 space-y-3">
                      <li className="flex">
                        <MapPin className="w-5 h-5 mr-3 text-blue-400" />
                        <span className="text-gray-300">{ theater.location}</span>
                      </li>
                      <li className="flex">
                        <Phone className="w-5 h-5 mr-3 text-green-400" />
                        <span className="text-gray-300">{theater.phone}</span>
                      </li>
                      <li className="flex">
                        <Mail className="w-5 h-5 mr-3 text-red-400" />
                        <span className="text-gray-300">{theater.email}</span>
                      </li>
                      {/* <li className="flex">
                        <Globe className="w-5 h-5 mr-3 text-indigo-400" />
                        <span className="text-gray-300">{theater.website || 'Not available'}</span>
                      </li> */}
                      <li className="flex">
                        <Clock className="w-5 h-5 mr-3 text-yellow-400" />
                        <span className="text-gray-300">
                          {theater.openingHours || 'Not available'}
                        </span>
                      </li>
                    </ul>
                  </motion.div>

                  <motion.div
                    className="p-4 bg-gray-800 rounded-lg border border-gray-700"
                    whileHover={{ y: -5 }}
                  >
                    <h4 className="text-lg font-semibold text-white">Rating</h4>
                    <div className="flex items-center mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= theater.rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-500'
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-gray-300">
                        {theater.rating.toFixed(1)} ({theater.reviewCount || 0} reviews)
                      </span>
                    </div>
                  </motion.div>

                  <motion.div
                    className="p-4 bg-gray-800 rounded-lg border border-gray-700 h-60"
                    whileHover={{ y: -5 }}
                  >
                    <h4 className="text-lg font-semibold text-white mb-2">Location</h4>
                    <div className="h-44 w-full rounded-lg overflow-hidden">
                      {isLoaded ? (
                        <GoogleMap
                          mapContainerStyle={{ width: '100%', height: '100%' }}
                          center={coordinates}
                          zoom={15}
                          options={{ disableDefaultUI: true, zoomControl: true }}
                        >
                          <Marker position={coordinates}>
                            <InfoWindow position={coordinates}>
                              <div className="text-gray-800 font-medium">
                                <div>{theater.name}</div>
                                <div className="text-gray-600 text-sm">
                                  {theater.address || theater.location}
                                </div>
                              </div>
                            </InfoWindow>
                          </Marker>
                        </GoogleMap>
                      ) : (
                        <div className="h-full bg-gray-700 border border-gray-600 rounded-lg flex items-center justify-center">
                          <p className="text-gray-400">Loading map...</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>

            <div className="flex justify-end p-4 border-t border-gray-700">
              <motion.button
                onClick={onClose}
                className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-500 font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TheaterModal;