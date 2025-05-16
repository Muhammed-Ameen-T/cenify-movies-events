import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import SeatComponent from './SeatComponent';
import { Seat } from '../../types/theater';

interface DraggableSeatProps {
  seat: Seat;
  onClick: (seat: Seat) => void;
  onContextMenu: (seat: Seat) => void;
  selected: boolean;
}

const DraggableSeat: React.FC<DraggableSeatProps> = ({ seat, onClick, onContextMenu, selected }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: seat.id,
    data: {
      type: 'seat',
      seat
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
    zIndex: isDragging ? 10 : 'auto',
    touchAction: 'none',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="transition-transform touch-none select-none"
    >
      <SeatComponent 
        seat={seat} 
        onClick={onClick} 
        onContextMenu={onContextMenu} 
        selected={selected} 
      />
    </div>
  );
};

export default DraggableSeat;