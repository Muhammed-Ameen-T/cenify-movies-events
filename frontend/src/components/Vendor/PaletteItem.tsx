import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { SEAT_TYPES } from '../../constants/seatTypes';
import { SeatType } from '../../constants/seatTypes';

interface PaletteItemProps {
  type: SeatType;
  onDragStart: (type: SeatType) => void;
}

const PaletteItem: React.FC<PaletteItemProps> = ({ type }) => {
  const seatTypeInfo = SEAT_TYPES[type];

  const { attributes, listeners, setNodeRef } = useDraggable({
    id: `palette-${type}`,
  });

  const getSeatStyle = () => {
    switch (type) {
      case 'RECLINER':
        return 'w-10 h-9 rounded-lg';
      case 'DISABLED':
        return 'w-8 h-8 rounded-t-lg';
      default:
        return 'w-8 h-8 rounded-t-lg';
    }
  };

  return (
    <div className="flex flex-col items-center mb-4 cursor-grab">
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        className={`${getSeatStyle()} ${seatTypeInfo.color} flex items-center justify-center`}
      >
        {type === 'RECLINER' ? 'R' : ''}
      </div>
      <span className="text-xs mt-1">{seatTypeInfo.name}</span>
      <span className="text-xs opacity-70">₹{seatTypeInfo.price}</span>
    </div>
  );
};

export default PaletteItem;