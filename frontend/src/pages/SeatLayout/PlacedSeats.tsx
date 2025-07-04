import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { useTheater } from './TheaterContext';
import { Seat, SeatType } from './theater.types';
import SeatVisual from './SeatVisual';
import { Check, Type, Trash2 } from 'lucide-react';

interface PlacedSeatProps {
  seat: Seat;
  isSelected: boolean;
  style?: React.CSSProperties;
}

const PlacedSeat: React.FC<PlacedSeatProps> = ({ seat, isSelected, style }) => {
  const { 
    currentLayout, 
    selectSeat, 
    removeSeat, 
    updateSeatType, 
    selectedSeats, 
    moveSeats 
  } = useTheater();
  
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

  // Define getSeatById before useDrag
  const getSeatById = React.useCallback(
    (id: string): Seat | undefined => {
      const foundSeat = currentLayout?.seats.find((s) => s.id === id);
      if (!foundSeat) {
        console.warn(`Seat with ID ${id} not found in theater context`);
      }
      return foundSeat;
    },
    [currentLayout]
  );

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'PLACED_SEAT',
    item: { 
      type: 'PLACED_SEAT', 
      id: seat.id,
      position: { row: seat.row, column: seat.column },
      seatType: seat.type,
      seats: isSelected 
        ? Object.keys(selectedSeats)
            .filter((id) => selectedSeats[id])
            .map((id) => getSeatById(id) || seat) // Fallback to current seat
        : [seat]
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    }),
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult() as { position?: { row: number; column: number } } | null;
      if (!dropResult || !dropResult.position) return;
      
      const rowOffset = dropResult.position.row - seat.row;
      const columnOffset = dropResult.position.column - seat.column;
      
      if (rowOffset === 0 && columnOffset === 0) return;
      
      const seatsToMove = isSelected ? item.seats : [seat];
      moveSeats(seatsToMove, rowOffset, columnOffset);
    }
  }), [seat, isSelected, selectedSeats, moveSeats, currentLayout]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectSeat(seat.id, e.ctrlKey || e.metaKey || e.shiftKey);
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  const handleContextMenuAction = (action: 'delete' | 'type', type?: SeatType) => {
    if (action === 'delete') {
      removeSeat(seat.id);
    } else if (action === 'type' && type) {
      updateSeatType(seat.id, type);
    }
    setShowContextMenu(false);
  };

  const closeContextMenu = () => {
    setShowContextMenu(false);
  };

  return (
    <>
      <div 
        ref={drag}
        style={{
          ...style,
          opacity: isDragging ? 0.5 : 1,
          cursor: 'move',
          position: 'absolute',
          zIndex: isSelected ? 10 : 5
        }} 
        onClick={handleClick}
        onContextMenu={handleRightClick}
      >
        <SeatVisual
          type={seat.type}
          isSelected={isSelected}
          number={seat.number}
        />
      </div>

      {showContextMenu && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={closeContextMenu}
          />
          <div 
            className="fixed z-50 bg-gray-800 border border-gray-700 rounded-md shadow-lg py-1 min-w-[160px]"
            style={{ 
              left: contextMenuPosition.x, 
              top: contextMenuPosition.y 
            }}
          >
            <div className="px-3 py-2 text-sm font-medium border-b border-gray-700 mb-1 flex items-center">
              <Type size={14} className="mr-2" />
              <span>Seat {seat.number}</span>
            </div>
            
            <button 
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center transition-colors"
              onClick={() => handleContextMenuAction('type', 'regular')}
            >
              <span className="w-5 text-center mr-2">
                {seat.type === 'regular' && <Check size={14} className="inline text-green-400" />}
              </span>
              <span className="text-blue-400">Regular</span>
            </button>
            
            <button 
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center transition-colors"
              onClick={() => handleContextMenuAction('type', 'premium')}
            >
              <span className="w-5 text-center mr-2">
                {seat.type === 'premium' && <Check size={14} className="inline text-green-400" />}
              </span>
              <span className="text-purple-400">Premium</span>
            </button>
            
            <button 
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center transition-colors"
              onClick={() => handleContextMenuAction('type', 'vip')}
            >
              <span className="w-5 text-center mr-2">
                {seat.type === 'vip' && <Check size={14} className="inline text-green-400" />}
              </span>
              <span className="text-amber-400">VIP</span>
            </button>
            
            <button 
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center transition-colors"
              onClick={() => handleContextMenuAction('type', 'unavailable')}
            >
              <span className="w-5 text-center mr-2">
                {seat.type === 'unavailable' && <Check size={14} className="inline text-green-400" />}
              </span>
              <span className="text-gray-400">Unavailable</span>
            </button>
            
            <div className="border-t border-gray-700 my-1"></div>
            
            <button 
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-700 flex items-center text-red-400 transition-colors"
              onClick={() => handleContextMenuAction('delete')}
            >
              <span className="w-5 text-center mr-2">
                <Trash2 size={14} className="inline" />
              </span>
              <span>Delete</span>
            </button>
          </div>
        </>
      )}
    </>
  );
};

export default React.memo(PlacedSeat);