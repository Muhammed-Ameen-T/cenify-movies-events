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
    console.error('Seat prop is undefined or null');
    return <div className="w-8 h-8 bg-gray-300 rounded-t-lg flex items-center justify-center">?</div>;
  }

  const seatTypeInfo = SEAT_TYPES[seat.type] || SEAT_TYPES.REGULAR;

  const getSeatStyle = () => {
    switch (seat.type) {
      case 'RECLINER':
        return 'w-10 h-9 rounded-lg';
      case 'DISABLED':
        return 'w-8 h-8 rounded-t-lg';
      default:
        return 'w-8 h-8 rounded-t-lg';
    }
  };

  return (
    <div
      className={`${getSeatStyle()} flex items-center justify-center text-xs font-bold cursor-pointer
        ${seatTypeInfo.color} ${selected ? 'ring-2 ring-white' : ''}
        ${seat.occupied ? 'opacity-50' : 'hover:opacity-80'} transition-all duration-200`}
      onClick={() => onClick(seat)}
      onContextMenu={e => {
        e.preventDefault();
        onContextMenu(seat);
      }}
      title={`${seat.label} - ${seatTypeInfo.name} (₹${seat.price})`}
    >
      {seat.label}
    </div>
  );
};

export default SeatComponent;