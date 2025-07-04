import React from 'react';
import { Show } from '../../types/show';

interface ShowModalProps {
  isOpen: boolean;
  onClose: () => void;
  show: Show;
}

const ShowViewModal: React.FC<ShowModalProps> = ({ isOpen, onClose, show }) => {
  if (!isOpen) return null;

//   const formatDate = (date: string | Date) => {
//     return new Intl.DateTimeFormat('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit',
//     }).format(new Date(date));
//   };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Show Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-4 text-gray-300">
          <div>
            <span className="font-medium text-white">Show ID:</span> {show.id}
          </div>
          <div>
            <span className="font-medium text-white">Movie:</span> {show.movieId.name || show.movieId._id}
          </div>
          <div>
            <span className="font-medium text-white">Theater:</span> {show.theaterId.name || show.theaterId._id}
          </div>
          <div>
            <span className="font-medium text-white">Screen:</span> {show.screenId.name || show.screenId._id}
          </div>
          <div>
            <span className="font-medium text-white">Vendor ID:</span> {show.vendorId}
          </div>
          <div>
            <span className="font-medium text-white">Show Date:</span> {show.showDate}
          </div>
          <div>
            <span className="font-medium text-white">Start Time:</span> {show.startTime}
          </div>
          <div>
            <span className="font-medium text-white">End Time:</span> {show.endTime ? show.endTime : 'N/A'}
          </div>
          <div>
            <span className="font-medium text-white">Status:</span>{' '}
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                show.status === 'Scheduled'
                  ? 'bg-blue-500'
                  : show.status === 'Running'
                  ? 'bg-green-500'
                  : show.status === 'Completed'
                  ? 'bg-gray-500'
                  : 'bg-red-500'
              } text-white`}
            >
              {show.status}
            </span>
          </div>
          <div>
            <span className="font-medium text-white">Booked Seats:</span>
            {show.bookedSeats && show.bookedSeats.length > 0 ? (
              <ul className="mt-2 space-y-2">
                {show.bookedSeats.map((seat, index) => (
                  <li key={index} className="border border-gray-600 rounded p-2">
                    <div>Seat Number: {seat.seatNumber}</div>
                    <div>Type: {seat.type}</div>
                    <div>Price: ${seat.seatPrice}</div>
                    <div>Position: Row {seat.position.row}, Col {seat.position.col}</div>
                    <div>User ID: {seat.userId}</div>
                    <div>Date: {new Date(seat.date).toLocaleDateString()}</div>
                    <div>Pending: {seat.isPending ? 'Yes' : 'No'}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-400">No seats booked</div>
            )}
          </div>
          {/* <div>
            <span className="font-medium text-white">Created At:</span> {show.createdAt}
          </div>
          <div>
            <span className="font-medium text-white">Updated At:</span> {show.updatedAt}
          </div> */}
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShowViewModal;