import React from 'react';
import { motion } from 'framer-motion';
import { X, Users, Grid3X3, Calendar, Clock } from 'lucide-react';
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
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden border border-gray-200 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold mb-1">{layout.layoutName}</h2>
              <div className="flex items-center gap-4 text-blue-100 text-sm">
                <div className="flex items-center gap-2">
                  <Users size={16} />
                  <span>{layout.capacity} seats</span>
                </div>
                <div className="flex items-center gap-2">
                  <Grid3X3 size={16} />
                  <span>{layout.rowCount} × {layout.columnCount}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all duration-200"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(85vh-100px)]">
          {/* Left Panel - Seat Layout */}
          <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-800 overflow-auto">
            <div className="flex flex-col items-center">
              {/* Seat Grid */}
              {layout.seatIds && layout.seatIds.length > 0 && (
                <div className="w-full max-w-2xl mb-6">
                  <div 
                    className="grid gap-1.5 justify-center"
                    style={{ 
                      gridTemplateColumns: `repeat(${layout.columnCount}, minmax(0, 1fr))`,
                      maxWidth: `${layout.columnCount * 40}px`,
                      margin: '0 auto'
                    }}
                  >
                    {Array.from({ length: layout.rowCount }).map((_, row) =>
                      Array.from({ length: layout.columnCount }).map((_, col) => {
                        // Fixed: Use 0-based indexing to match with seat positions starting from row 0, col 0
                        const seat = layout.seatIds.find(
                          (s) => s.position.row === row && s.position.col === col
                        );
                        
                        const getSeatStyle = () => {
                          if (!seat) return 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed';
                          
                          switch (seat.type) {
                            case 'VIP':
                              return 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-black shadow-md hover:shadow-lg transform hover:scale-105';
                            case 'Premium':
                              return 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-md hover:shadow-lg transform hover:scale-105';
                            case 'Regular':
                              return 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-md hover:shadow-lg transform hover:scale-105';
                            default:
                              return 'bg-gray-400 text-white';
                          }
                        };

                        return (
                          <motion.div
                            key={`${row}-${col}`}
                            whileHover={seat ? { scale: 1.05 } : {}}
                            className={`
                              w-8 h-8 flex items-center justify-center text-xs font-bold rounded-md
                              transition-all duration-200 cursor-pointer
                              ${getSeatStyle()}
                            `}
                            title={seat ? `${seat.number} (${seat.type})` : 'Empty'}
                          >
                            {seat ? seat.number : ''}
                          </motion.div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Screen - Moved to bottom */}
              <div className="w-full max-w-2xl">
                <div className="bg-gradient-to-r from-gray-800 to-gray-700 text-white text-center py-3 rounded-b-2xl shadow-lg">
                  <div className="w-12 h-1 bg-white/50 mx-auto mb-1 rounded"></div>
                  <div className="text-base font-semibold">SCREEN</div>
                </div>
              </div>

              {/* Legend */}
              <div className="mt-6 bg-white dark:bg-gray-900 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
                <h4 className="text-base font-semibold mb-3 text-gray-800 dark:text-white">Seat Legend</h4>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-gradient-to-br from-green-500 to-green-600 rounded-md shadow"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Regular - ₹{layout.seatPrice.regular}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-md shadow"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Premium - ₹{layout.seatPrice.premium}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-md shadow"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">VIP - ₹{layout.seatPrice.vip}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Unavailable</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Details */}
          <div className="w-64 bg-white dark:bg-gray-900 p-6 border-l border-gray-200 dark:border-gray-700 overflow-auto">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3">Layout Details</h3>
                
                <div className="space-y-3">
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="text-blue-600" size={18} />
                      <span className="font-semibold text-gray-800 dark:text-white text-sm">Capacity</span>
                    </div>
                    <p className="text-xl font-bold text-blue-600">{layout.capacity}</p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Grid3X3 className="text-purple-600" size={18} />
                      <span className="font-semibold text-gray-800 dark:text-white text-sm">Dimensions</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{layout.rowCount} rows × {layout.columnCount} columns</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 p-3 rounded-lg border border-green-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-800 dark:text-white mb-2 text-sm">Pricing Tiers</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-green-700 dark:text-green-400 font-medium text-sm">Regular</span>
                        <span className="font-bold text-gray-800 dark:text-white text-sm">₹{layout.seatPrice.regular}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-purple-700 dark:text-purple-400 font-medium text-sm">Premium</span>
                        <span className="font-bold text-gray-800 dark:text-white text-sm">₹{layout.seatPrice.premium}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-yellow-700 dark:text-yellow-400 font-medium text-sm">VIP</span>
                        <span className="font-bold text-gray-800 dark:text-white text-sm">₹{layout.seatPrice.vip}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Calendar size={16} />
                      <div>
                        <p className="text-xs font-medium">Created</p>
                        <p className="text-xs">{new Date(layout.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Clock size={16} />
                      <div>
                        <p className="text-xs font-medium">Last Updated</p>
                        <p className="text-xs">{new Date(layout.updatedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Button */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="secondary"
                onClick={onClose}
                className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white py-2 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl text-sm"
                aria-label="Close modal"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ViewSeatLayoutModal;