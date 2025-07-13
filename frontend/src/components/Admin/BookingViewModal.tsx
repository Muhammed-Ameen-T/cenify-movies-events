// src/components/Admin/BookingDetailsModal.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Ticket, Film, MapPin, User, DollarSign, Calendar ,Tag} from 'lucide-react';
import { CreateBookingResponse } from '../../types/booking';
import { formatRelativeTime } from '../../utils/timeFormator';

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: CreateBookingResponse;
}

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({ isOpen, onClose, booking }) => {
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-gray-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-gray-700"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Ticket className="w-6 h-6 text-blue-400" />
                Booking Details
              </h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="text-gray-400 hover:text-white"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>

            <div className="space-y-4 text-gray-300">
              <div className="flex items-start gap-3">
                <Ticket className="w-5 h-5 mt-1 text-blue-400" />
                <div>
                  <p className="text-sm font-semibold text-gray-400">Booking ID</p>
                  <p className="text-white">{booking.bookingId}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Film className="w-5 h-5 mt-1 text-blue-400" />
                <div>
                  <p className="text-sm font-semibold text-gray-400">Movie</p>
                  <p className="text-white">{booking.showId?.movieId?.name || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-1 text-blue-400" />
                <div>
                  <p className="text-sm font-semibold text-gray-400">Theater</p>
                  <p className="text-white">{booking.showId?.theaterId?.name || 'N/A'}</p>
                  <p className="text-sm">{booking.showId?.theaterId?.location?.city || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 mt-1 text-blue-400" />
                <div>
                  <p className="text-sm font-semibold text-gray-400">Show Time</p>
                  <p className="text-white">
                    {new Intl.DateTimeFormat('en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    }).format(new Date(booking.showId?.startTime || ''))}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="w-5 h-5 mt-1 text-blue-400" />
                <div>
                  <p className="text-sm font-semibold text-gray-400">User</p>
                  <p className="text-white">{booking.userId?.name || 'N/A'}</p>
                  <p className="text-sm">{booking.userId?.email || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Ticket className="w-5 h-5 mt-1 text-blue-400" />
                <div>
                  <p className="text-sm font-semibold text-gray-400">Booked Seats</p>
                  <p className="text-white">
                    {booking.bookedSeatsId?.map((seat) => seat.number).join(', ') || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 mt-1 text-blue-400" />
                <div>
                  <p className="text-sm font-semibold text-gray-400">Payment</p>
                  <p className="text-white">Total: ₹{booking.totalAmount.toFixed(2)}</p>
                  <p className="text-sm">Method: {booking.payment.method}</p>
                  <p className="text-sm">
                    Status:{' '}
                    <span
                      className={`text-xs font-medium ${
                        booking.payment.status === 'completed' ? 'text-green-400' : 'text-yellow-400'
                      }`}
                    >
                      {booking.payment.status.charAt(0).toUpperCase() + booking.payment.status.slice(1)}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Tag className="w-5 h-5 mt-1 text-blue-400" />
                <div>
                  <p className="text-sm font-semibold text-gray-400">Status</p>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
                      booking.status === 'confirmed' ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  >
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 mt-1 text-blue-400" />
                <div>
                  <p className="text-sm font-semibold text-gray-400">Created</p>
                  <p className="text-white">{formatRelativeTime(booking.createdAt)}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
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