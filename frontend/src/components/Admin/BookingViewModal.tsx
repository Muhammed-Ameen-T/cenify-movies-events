// src/components/Admin/BookingDetailsModal.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Ticket, Film, MapPin, User, DollarSign, Calendar, Tag } from 'lucide-react';
import { CreateBookingResponse } from '../../types/booking';
import { formatRelativeTime } from '../../utils/timeFormator';

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: CreateBookingResponse;
}

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({ isOpen, onClose, booking }) => {
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 max-w-4xl w-full shadow-2xl border border-gray-600/50 relative overflow-hidden"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative gradient overlay */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
            
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Ticket className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Booking Details</h2>
                  <p className="text-sm text-gray-400">#{booking.bookingId}</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column - Movie & Theater Info */}
              <div className="space-y-4">
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                  <div className="flex items-center gap-3 mb-3">
                    <Film className="w-5 h-5 text-blue-400" />
                    <h3 className="font-semibold text-white">Movie Details</h3>
                  </div>
                  <p className="text-white font-medium mb-2">{booking.showId?.movieId?.name || 'N/A'}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <MapPin className="w-4 h-4 text-blue-400" />
                    <div>
                      <p className="font-medium">{booking.showId?.theaterId?.name || 'N/A'}</p>
                      <p className="text-gray-400">{booking.showId?.theaterId?.location?.city || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                  <div className="flex items-center gap-3 mb-3">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    <h3 className="font-semibold text-white">Show Time</h3>
                  </div>
                  <p className="text-white">
                    {new Intl.DateTimeFormat('en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    }).format(new Date(booking.showId?.startTime || ''))}
                  </p>
                </div>
              </div>

              {/* Middle Column - User & Seats */}
              <div className="space-y-4">
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                  <div className="flex items-center gap-3 mb-3">
                    <User className="w-5 h-5 text-blue-400" />
                    <h3 className="font-semibold text-white">Customer</h3>
                  </div>
                  <p className="text-white font-medium">{booking.userId?.name || 'N/A'}</p>
                  <p className="text-sm text-gray-400">{booking.userId?.email || 'N/A'}</p>
                </div>

                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                  <div className="flex items-center gap-3 mb-3">
                    <Ticket className="w-5 h-5 text-blue-400" />
                    <h3 className="font-semibold text-white">Seats</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {booking.bookedSeatsId?.map((seat, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium">
                        {seat.number}
                      </span>
                    )) || <span className="text-gray-400">N/A</span>}
                  </div>
                </div>
              </div>

              {/* Right Column - Payment & Status */}
              <div className="space-y-4">
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                  <div className="flex items-center gap-3 mb-3">
                    <DollarSign className="w-5 h-5 text-blue-400" />
                    <h3 className="font-semibold text-white">Payment</h3>
                  </div>
                  <p className="text-2xl font-bold text-white mb-2">₹{booking.totalAmount.toFixed(2)}</p>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-300">Method: {booking.payment.method}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-300">Status:</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          booking.payment.status === 'completed' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}
                      >
                        {booking.payment.status.charAt(0).toUpperCase() + booking.payment.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Tag className="w-5 h-5 text-blue-400" />
                      <h3 className="font-semibold text-white">Status</h3>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        booking.status === 'confirmed' 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>Created {formatRelativeTime(booking.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="px-6 py-2 bg-gradient-to-r from-gray-700 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-500 transition-all duration-200 font-medium"
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BookingDetailsModal;