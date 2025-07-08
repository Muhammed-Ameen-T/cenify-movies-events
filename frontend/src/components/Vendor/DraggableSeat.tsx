import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
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
  } = useSortable({ id: seat.id });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="transition-transform"
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