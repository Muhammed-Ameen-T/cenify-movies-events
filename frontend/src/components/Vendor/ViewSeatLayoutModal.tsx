// src/components/Vendor/ViewSeatLayoutModal.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { SeatLayoutResponse } from '../../types/seatLayout';
import Button from '../ui/Button';

interface ViewSeatLayoutModalProps {
  layout: SeatLayoutResponse;
  onClose: () => void;
}

const ViewSeatLayoutModal: React.FC<ViewSeatLayoutModalProps> = ({ layout, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-gray-900/90 border border-gray-700/30 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">{layout.layoutName}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300 transition-colors"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>
        <div className="text-gray-300 space-y-4">
          <p><strong>Capacity:</strong> {layout.capacity}</p>
          <p><strong>Rows × Columns:</strong> {layout.rowCount} × {layout.columnCount}</p>
          <p><strong>Seat Prices:</strong></p>
          <ul className="ml-4 list-disc">
            <li>Regular: ${layout.seatPrice.regular}</li>
            <li>Premium: ${layout.seatPrice.premium}</li>
            <li>VIP: ${layout.seatPrice.vip}</li>
          </ul>
          {layout.seatIds && layout.seatIds.length > 0 && (
            <>
              <p><strong>Seats:</strong></p>
              <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${layout.columnCount}, minmax(0, 1fr))` }}>
                {Array.from({ length: layout.rowCount }).map((_, row) =>
                  Array.from({ length: layout.columnCount }).map((_, col) => {
                    const seat = layout.seatIds.find(
                      (s) => s.position.row === row + 1 && s.position.col === col + 1
                    );
                    return (
                      <div
                        key={`${row}-${col}`}
                        className={`p-2 text-center text-sm rounded ${
                          seat
                            ? seat.type === 'VIP'
                              ? 'bg-yellow-600 text-black'
                              : seat.type === 'Premium'
                              ? 'bg-purple-600 text-white'
                              : seat.type === 'Regular'
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-700 text-gray-400'
                            : 'bg-gray-800 text-gray-600'
                        }`}
                        title={seat ? `${seat.number} (${seat.type})` : 'Empty'}
                      >
                        {seat ? seat.number : '–'}
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
          <p><strong>Created At:</strong> {new Date(layout.createdAt).toLocaleString()}</p>
          <p><strong>Updated At:</strong> {new Date(layout.updatedAt).toLocaleString()}</p>
        </div>
        <div className="mt-6 flex justify-end">
          <Button
            variant="secondary"
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 text-white"
            aria-label="Close modal"
          >
            Close
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ViewSeatLayoutModal;