import React from 'react';
import { Show } from '../../types/show';

interface ShowModalProps {
  isOpen: boolean;
  onClose: () => void;
  show: Show;
}

const ShowViewModal: React.FC<ShowModalProps> = ({ isOpen, onClose, show }) => {
  if (!isOpen) return null;

  // Format date and time helpers
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'bg-blue-500 text-blue-100';
      case 'Running': return 'bg-green-500 text-green-100';
      case 'Completed': return 'bg-gray-500 text-gray-100';
      default: return 'bg-red-500 text-red-100';
    }
  };

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <h2 className="text-xl font-bold text-white">Show Details</h2>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(show.status)}`}>
              {show.status}
            </span>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-700 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Main Content - Horizontal Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Section - Movie & Theater Info */}
          <div className="flex-1 p-4 border-r border-gray-700 overflow-y-auto">
            <div className="space-y-4">
              {/* Movie Information */}
              <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                <h3 className="text-base font-semibold text-white mb-2 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/>
                  </svg>
                  Movie Information
                </h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Title:</span>
                    <span className="font-medium text-white">{show.movieId?.name || show.movieId}</span>
                  </div>
                  {show.movieId?.genre && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Genre:</span>
                      <span>{show.movieId.genre.join(', ')}</span>
                    </div>
                  )}
                  {show.movieId?.rating && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Rating:</span>
                      <span className="flex items-center">
                        {show.movieId.rating}/5
                        <svg className="w-3 h-3 ml-1 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Theater & Screen Information */}
              <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                <h3 className="text-base font-semibold text-white mb-2 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd"/>
                  </svg>
                  Theater & Screen
                </h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Theater:</span>
                    <span className="font-medium text-white">{show.theaterId?.name || show.theaterId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Screen:</span>
                    <span className="font-medium text-white">{show.screenId?.name || show.screenId}</span>
                  </div>
                  {show.theaterId?.location && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Location:</span>
                      <span>{show.theaterId.location.city || 'N/A'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Show Timing */}
              <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                <h3 className="text-base font-semibold text-white mb-2 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                  </svg>
                  Schedule
                </h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Date:</span>
                    <span className="font-medium text-white">{formatDate(show.showDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Start Time:</span>
                    <span className="font-medium text-green-400">{formatTime(show.startTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">End Time:</span>
                    <span className="font-medium text-red-400">
                      {show.endTime ? formatTime(show.endTime) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Booking Information */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              {/* Booking Summary */}
              <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                <h3 className="text-base font-semibold text-white mb-2 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Booking Summary
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm text-gray-300">
                  <div className="text-center p-2 bg-gray-700/50 rounded">
                    <div className="text-lg font-bold text-white">{show.bookedSeats?.length || 0}</div>
                    <div className="text-xs text-gray-400">Booked Seats</div>
                  </div>
                  <div className="text-center p-2 bg-gray-700/50 rounded">
                    <div className="text-lg font-bold text-white">
                      ₹ {show.bookedSeats?.reduce((total, seat) => total + (seat.seatPrice || 0), 0).toFixed(2) || '0.00'}
                    </div>
                    <div className="text-xs text-gray-400">Total Revenue</div>
                  </div>
                </div>
              </div>

              {/* Booked Seats Details */}
              <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                <h3 className="text-base font-semibold text-white mb-2 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  Booked Seats ({show.bookedSeats?.length || 0})
                </h3>
                
                {show.bookedSeats && show.bookedSeats.length > 0 ? (
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {show.bookedSeats.map((seat, index) => (
                      <div key={index} className="bg-gray-700/50 border border-gray-600 rounded-lg p-2 hover:bg-gray-700/70 transition-colors">
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center space-x-1">
                            <span className="bg-blue-500 text-white px-1.5 py-0.5 rounded text-xs font-medium">
                              {seat.seatNumber}
                            </span>
                            <span className="text-gray-300 text-xs">{seat.type}</span>
                          </div>
                          <span className="text-green-400 font-medium text-sm">${seat.seatPrice}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-1 text-xs text-gray-400">
                          <div>Position: Row {seat.position?.row}, Col {seat.position?.col}</div>
                          <div>Date: {new Date(seat.date).toLocaleDateString()}</div>
                          <div>User: {seat.userId?.slice(-8) || 'N/A'}</div>
                          <div className="flex items-center">
                            Status: 
                            <span className={`ml-1 px-1 py-0.5 rounded text-xs ${
                              seat.isPending ? 'bg-yellow-500 text-yellow-100' : 'bg-green-500 text-green-100'
                            }`}>
                              {seat.isPending ? 'Pending' : 'Confirmed'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <svg className="w-8 h-8 text-gray-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                    </svg>
                    <p className="text-gray-400 text-sm">No seats booked yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-4 border-t border-gray-700 bg-gray-900/50 flex-shrink-0">
          <div className="text-xs text-gray-400">
            {/* Show ID: <span className="text-gray-300">{show.id}</span> */}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200 font-medium shadow-lg text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShowViewModal;