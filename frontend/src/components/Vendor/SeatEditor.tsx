import React, { useState } from 'react';
import { Edit3 } from 'lucide-react';
import { Seat } from '../../types/theater';
import { SEAT_TYPES } from '../../constants/seatTypes';
import Modal from './Modal';

interface SeatEditorProps {
  seat: Seat;
  onSave: (seat: Seat) => void;
  onClose: () => void;
}

const SeatEditor: React.FC<SeatEditorProps> = ({ seat, onSave, onClose }) => {
  const [editedSeat, setEditedSeat] = useState<Seat>({ ...seat });

  const handleTypeChange = (type: keyof typeof SEAT_TYPES) => {
    setEditedSeat({
      ...editedSeat,
      type,
      price: SEAT_TYPES[type].price
    });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedSeat({
      ...editedSeat,
      price: parseInt(e.target.value, 10) || 0
    });
  };

  return (
    <Modal title={`Edit Seat ${seat.label}`} icon={<Edit3 size={20} />} onClose={onClose}>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-1">Seat Type</label>
        <select
          value={editedSeat.type}
          onChange={(e) => handleTypeChange(e.target.value as keyof typeof SEAT_TYPES)}
          className="w-full bg-[#2B2B40] border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {Object.keys(SEAT_TYPES).map((type) => (
            <option key={type} value={type}>
              {SEAT_TYPES[type as keyof typeof SEAT_TYPES].name}
            </option>
          ))}
        </select>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-1">Price (₹)</label>
        <input
          type="number"
          value={editedSeat.price}
          onChange={handlePriceChange}
          min="0"
          className="w-full bg-[#2B2B40] border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
        <select
          value={editedSeat.occupied ? "occupied" : "available"}
          onChange={(e) => setEditedSeat({...editedSeat, occupied: e.target.value === "occupied"})}
          className="w-full bg-[#2B2B40] border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="available">Available</option>
          <option value="occupied">Occupied</option>
        </select>
      </div>
      
      <div className="flex justify-end space-x-3 mt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(editedSeat)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors"
        >
          Save Changes
        </button>
      </div>
    </Modal>
  );
};

export default SeatEditor;