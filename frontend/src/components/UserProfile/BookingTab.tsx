import React from 'react';
import { motion } from 'framer-motion';
import { Booking } from '../../types';

interface BookingsTabProps {
  bookings: Booking[];
}

const BookingsTab: React.FC<BookingsTabProps> = ({ bookings }) => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1 
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="bg-white rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Your Bookings</h2>
        <div className="mb-4">
          <div className="flex space-x-2">
            <button className="bg-[#FFCC00] text-gray-900 px-4 py-2 rounded-lg font-medium">All</button>
            <button className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">Upcoming</button>
            <button className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">Past</button>
          </div>
        </div>
        <div className="space-y-4">
          {bookings.map((booking) => (
            <motion.div
              key={booking.id}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className={`bg-white border ${booking.upcoming ? 'border-[#FFCC00]' : 'border-gray-200'} rounded-lg p-4 shadow-sm flex flex-col sm:flex-row gap-4`}
            >
              <div className="flex-shrink-0">
                <img src={booking.poster} alt={booking.movieTitle} className="w-24 h-36 object-cover rounded-lg shadow-md" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-900 text-lg">{booking.movieTitle}</h3>
                  {booking.upcoming && (
                    <span className="bg-[#FFF8E0] text-[#9A7A00] text-xs font-medium px-2.5 py-0.5 rounded-full">
                      Upcoming
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-sm text-gray-500">Date & Time</p>
                    <p className="font-medium text-gray-900">
                      {new Date(booking.date).toLocaleDateString()} • {booking.time}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-sm text-gray-500">Theater</p>
                    <p className="font-medium text-gray-900">{booking.theater}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-sm text-gray-500">Seats</p>
                    <p className="font-medium text-gray-900">{booking.seats.join(", ")}</p>
                  </div>
                </div>
                <div className="flex space-x-3 mt-3">
                  {booking.upcoming ? (
                    <>
                      <button className="bg-[#FFCC00] hover:bg-[#FFBB00] text-gray-900 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        View Tickets
                      </button>
                      <button className="bg-white border border-red-500 text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        Cancel Booking
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="bg-[#FFCC00] hover:bg-[#FFBB00] text-gray-900 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        View Receipt
                      </button>
                      <button className="bg-white border border-[#FFCC00] text-gray-900 hover:bg-[#FFF8E0] px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        Rate Movie
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BookingsTab;