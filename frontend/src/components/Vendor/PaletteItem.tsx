import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { SEAT_TYPES } from '../../constants/seatTypes';
import { SeatType } from '../../types/theater';

interface PaletteItemProps {
  type: SeatType;
  onDragStart: (type: SeatType) => void;
}

const PaletteItem: React.FC<PaletteItemProps> = ({ type, onDragStart }) => {
  const seatTypeInfo = SEAT_TYPES[type];

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: {
      type: 'palette',
      seatType: type
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    touchAction: 'none',
  };

  return (
    <div className="flex flex-col items-center mb-4">
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        style={style}
        className={`w-10 h-10 ${seatTypeInfo.color} rounded-t-lg flex items-center justify-center
          shadow-md hover:shadow-lg hover:brightness-110 transition-all cursor-grab active:cursor-grabbing
          touch-none select-none`}
        onDragStart={() => onDragStart(type)}
      ></div>
      <span className="text-xs mt-1 font-medium">{seatTypeInfo.name}</span>
      <span className="text-xs opacity-70">₹{seatTypeInfo.price}</span>
    </div>
  );
};

export default PaletteItem;