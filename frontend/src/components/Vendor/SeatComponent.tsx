import React from 'react';
import { Seat } from '../../types/theater';
import { SEAT_TYPES } from '../../constants/seatTypes';

interface SeatComponentProps {
  seat: Seat | null;
  onClick: (seat: Seat) => void;
  onContextMenu: (seat: Seat) => void;
  selected: boolean;
}

const SeatComponent: React.FC<SeatComponentProps> = ({ seat, onClick, onContextMenu, selected }) => {
  if (!seat) {
    return <div className="w-10 h-10 opacity-0"></div>;
  }

  const seatTypeInfo = SEAT_TYPES[seat.type] || SEAT_TYPES.REGULAR;

  return (
    <div
      className={`w-10 h-10 ${seatTypeInfo.color} rounded-t-lg flex items-center justify-center text-xs font-bold 
        cursor-pointer ${selected ? 'ring-2 ring-white shadow-lg scale-110' : ''}
        ${seat.occupied ? 'opacity-50' : 'hover:opacity-80'} 
        transition-all duration-200 touch-none select-none`}
      onClick={() => onClick(seat)}
      onContextMenu={(e) => {
        e.preventDefault();
        onContextMenu(seat);
      }}
      title={`${seat.label} - ${seatTypeInfo.name} (₹${seat.price})`}
    >
      <span className="text-white drop-shadow-sm">{seat.label}</span>
    </div>
  );
};

export default SeatComponent;