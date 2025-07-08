// src/components/User/BookingDetailModal.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, MapPin, Users, CreditCard, Sparkles, Award, Ticket, Share2, Star } from 'lucide-react';
import { Booking } from '../../types/bookingResponse';

const modalVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
};

interface BookingDetailModalProps {
  booking: Booking | null;
  onClose: () => void;
  onShare: (booking: Booking) => void;
  onCancel: () => void;
  onRate: () => void;
}

const BookingDetailModal: React.FC<BookingDetailModalProps> = ({ booking, onClose, onShare, onCancel, onRate }) => {
  if (!booking) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-100 p-4 mt-16"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
    >
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-auto shadow-2xl border border-gray-200/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 id="booking-modal-title" className="text-3xl font-bold text-gray-900 mb-1 ">
              {booking.movieTitle}
            </h2>
            <div className="flex items-center gap-4">
              <div
                className={`px-4 py-1 rounded-full font-semibold ${
                  booking.status === 'confirmed' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-800'
                }`}
              >
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)} 
              </div>
              {booking.status=='cancelled' &&
                <span>Reason:  " {booking.reason} "</span>
              }
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full p-2"
            aria-label="Close booking details"
          >
            <X className="w-6 h-6" />
          </motion.button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <img
              src={booking.poster}
              alt={booking.movieTitle}
              className="w-full rounded-xl shadow-lg object-cover"
            />
          </div>
          <div className="lg:col-span-2 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-blue-50 p-6 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span className="font-bold text-blue-800">Show Details</span>
                </div>
                <p className="text-gray-900 font-semibold">
                  {new Date(booking.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-blue-600 font-bold text-lg">{booking.time}</p>
              </div>
              <div className="bg-purple-50 p-6 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  <span className="font-bold text-purple-800">Location</span>
                </div>
                <p className="text-gray-900 font-semibold">{booking.theater}</p>
                <p className="text-purple-600 font-medium">{booking.screen}</p>
              </div>
              <div className="bg-green-50 p-6 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-5 h-5 text-green-600" />
                  <span className="font-bold text-green-800">Seating</span>
                </div>
                <p className="text-gray-900 font-semibold">{booking.seats.length} Seats</p>
                <p className="text-green-600 font-bold">{booking.seats.join(', ')}</p>
              </div>
              <div className="bg-yellow-50 p-6 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="w-5 h-5 text-yellow-600" />
                  <span className="font-bold text-yellow-800">Payment</span>
                  {booking.status=='cancelled' && booking.paymentStatus=='completed'?(
                    <span className="inline-block text-xs font-medium px-2 py-1 bg-green-100 text-green-800 rounded-full">
                      Refunded
                    </span>
                  ):(
                    <span className=""></span>
                  )} 
                  {booking.paymentStatus == 'pending' && (
                    <div
                      className="text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 relative group bg-yellow-100 text-yellow-800 border border-yellow-300"
                    >
                      <X className="w-3 h-3 text-yellow-800" />
                      Pending

                      {/* Tooltip */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-max bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        Booking will cancel if payment isn't completed.
                      </div>
                    </div>
                  )}
                </div>

                {booking.status=='cancelled' && booking.paymentStatus=='completed' ?(
                  <div className='flex'>
                    <p className="text-gray-900 font-semibold">Refund Amount</p>  
                    <span className='text-xs mt-1 ml-1'>(15% Charge)</span>
                  </div>
                ):(
                  <p className="text-gray-900 font-semibold">Total Amount</p> 
                )}

                {booking.status=='cancelled' && booking.paymentStatus=='completed'?(
                  <>
                    <p className="text-yellow-600 font-bold text-lg">
                      {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(booking.totalAmount)}
                      {" - "}
                      {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(booking.totalAmount * 0.15)}
                      {" = "}
                      {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(booking.totalAmount - booking.totalAmount * 0.15)}
                    </p>
                    <span className='text-xs'>
                      {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(booking.totalAmount - booking.totalAmount * 0.15)}  will be Refunded to your wallet
                    </span>
                      
                  </>
                ):(
                  <p className="text-yellow-600 font-bold text-lg">
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(
                      booking.totalAmount
                    )}
                  </p>
                )}
              </div>
            </div>
            {/* <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-200">
              {booking.status === 'confirmed' ? (
                <>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onShare(booking)}
                    className="bg-white border-2 border-blue-300 text-blue-600 px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-blue-50"
                    aria-label={`Share booking for ${booking.movieTitle}`}
                  >
                    <Share2 className="w-5 h-5" />
                    Share Details
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onCancel}
                    className="bg-white border-2 border-red-300 text-red-600 px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-red-50"
                    aria-label={`Cancel booking for ${booking.movieTitle}`}
                  >
                    <X className="w-5 h-5" />
                    Cancel Booking
                  </motion.button>
                </>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onRate}
                  className="bg-white border-2 border-yellow-400 text-yellow-600 px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-yellow-50"
                  aria-label={`Rate ${booking.movieTitle}`}
                >
                  <Star className="w-5 h-5" />
                  Rate & Review
                </motion.button>
              )}
            </div> */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                Movie Experience
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 font-medium">Format:</span>
                  <p className="font-semibold text-gray-900">2D, {booking.language || 'Unknown'}</p>
                </div>
                <div>
                  <span className="text-gray-500 font-medium">Duration:</span>
                  <p className="font-semibold text-gray-900">{booking.duration}</p>
                </div>
                <div>
                  <span className="text-gray-500 font-medium">Genre:</span>
                  <p className="font-semibold text-gray-900">{booking.genre.join(', ')}</p>
                </div>
                <div>
                  <span className="text-gray-500 font-medium">Rating:</span>
                  <p className="font-semibold text-gray-900">{booking.rating}</p>
                </div>
              </div>
            </div>
            {booking.status === 'confirmed' && booking.qrCode && (
              <div className="bg-indigo-50 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-600" />
                  Booking Confirmation
                </h3>
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div>
                    <p className="text-sm text-indigo-600 font-medium">Booking ID</p>
                    <p className="text-2xl font-semibold text-indigo-900">{booking.bookingId}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-lg">
                    <img
                      src={booking.qrCode}
                      alt="QR Code for booking"
                      className="w-24 h-24 rounded-lg"
                    />
                  </div>
                </div>
                <p className="text-xs text-indigo-600 text-center mt-3">
                  Show this QR code at the theater entrance
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BookingDetailModal;