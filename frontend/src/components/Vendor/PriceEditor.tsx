import React, { useState } from 'react';
import { DollarSign } from 'lucide-react';
import { SEAT_TYPES } from '../../constants/seatTypes';
import { SeatType, PriceEditData } from '../../types/theater';
import Modal from './Modal';

interface PriceEditorProps {
  onSave: (data: PriceEditData[]) => void;
  onClose: () => void;
}

const PriceEditor: React.FC<PriceEditorProps> = ({ onSave, onClose }) => {
  const [prices, setPrices] = useState<PriceEditData[]>(
    Object.keys(SEAT_TYPES).map((type) => ({
      seatType: type as SeatType,
      price: SEAT_TYPES[type as SeatType].price
    }))
  );

  const handlePriceChange = (seatType: SeatType, price: number) => {
    setPrices(prevPrices =>
      prevPrices.map(item =>
        item.seatType === seatType ? { ...item, price } : item
      )
    );
  };

  return (
    <Modal title="Edit Seat Prices" icon={<DollarSign size={20} />} onClose={onClose}>
      <p className="text-gray-300 mb-4">
        Set prices for each seat type. All seats of the same type will be updated.
      </p>
      
      <div className="space-y-4 mb-6">
        {prices.map((item) => (
          <div key={item.seatType} className="flex items-center">
            <div className={`w-6 h-6 ${SEAT_TYPES[item.seatType].color} rounded-sm mr-3`}></div>
            <label className="flex-1 text-sm font-medium text-gray-300">
              {SEAT_TYPES[item.seatType].name}
            </label>
            <div className="flex items-center bg-[#2B2B40] border border-gray-600 rounded-md overflow-hidden">
              <span className="px-2 text-gray-400">₹</span>
              <input
                type="number"
                value={item.price}
                onChange={(e) => handlePriceChange(item.seatType, parseInt(e.target.value, 10) || 0)}
                min="0"
                className="w-24 bg-transparent border-0 px-2 py-2 text-white focus:outline-none"
              />
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-end space-x-3 mt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(prices)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors"
        >
          Update Prices
        </button>
      </div>
    </Modal>
  );
};

export default PriceEditor;