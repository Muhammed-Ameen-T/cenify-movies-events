import React from 'react';
import { useDrag } from 'react-dnd';
import { SeatType } from './theater.types';
import SeatVisual from './SeatVisual';
import { useTheater } from './TheaterContext';
import { ChevronDown, ChevronUp, Trash2, Key } from 'lucide-react';

interface SeatPaletteItemProps {
  seatType: SeatType;
}

const SeatPaletteItem: React.FC<SeatPaletteItemProps> = ({ seatType }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'SEAT',
    item: { type: 'SEAT', seatType },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  }));

  // Type-specific descriptions
  const typeDescriptions = {
    regular: 'Standard seating',
    premium: 'Better view seating',
    vip: 'Top-tier experience',
    unavailable: 'Reserved or blocked'
  };

  return (
    <div 
      ref={drag} 
      className={`cursor-grab p-2 rounded-md transition-all duration-200 ${
        isDragging ? 'opacity-50 scale-95' : 'opacity-100 hover:bg-gray-700'
      }`}
    >
      <div className="flex items-center space-x-3">
        <SeatVisual 
          type={seatType} 
          isSelected={false} 
        />
        <div>
          <p className="font-medium capitalize text-sm">
            {seatType === 'regular' && <span className="text-blue-400">{seatType}</span>}
            {seatType === 'premium' && <span className="text-purple-400">{seatType}</span>}
            {seatType === 'vip' && <span className="text-amber-400">{seatType}</span>}
            {seatType === 'unavailable' && <span className="text-gray-400">{seatType}</span>}
          </p>
          <p className="text-xs text-gray-400">{typeDescriptions[seatType]}</p>
        </div>
      </div>
    </div>
  );
};

const SeatPalette: React.FC = () => {
  const { selectedSeats, deleteSelectedSeats, changeSelectedSeatsType, currentLayout } = useTheater();
  const [showInfo, setShowInfo] = React.useState(true);
  
  const selectedCount = Object.keys(selectedSeats).filter(id => selectedSeats[id]).length;
  const seatTypes: SeatType[] = ['regular', 'premium', 'vip', 'unavailable'];

  return (
    <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="border-b border-gray-700">
        <h3 className="px-4 py-3 text-lg font-medium text-blue-400">Seat Types</h3>
      </div>
      
      <div className="p-4 space-y-2">
        {seatTypes.map((type) => (
          <SeatPaletteItem key={type} seatType={type} />
        ))}
      </div>
      
      {selectedCount > 0 && (
        <div className="p-4 border-t border-gray-700 bg-gray-750">
          <p className="text-sm mb-2">
            <span className="font-medium">{selectedCount}</span> seat{selectedCount !== 1 ? 's' : ''} selected
          </p>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => changeSelectedSeatsType('regular')}
              className="px-2 py-1 text-xs rounded bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Regular
            </button>
            <button 
              onClick={() => changeSelectedSeatsType('premium')}
              className="px-2 py-1 text-xs rounded bg-purple-600 hover:bg-purple-700 transition-colors"
            >
              Premium
            </button>
            <button 
              onClick={() => changeSelectedSeatsType('vip')}
              className="px-2 py-1 text-xs rounded bg-amber-600 hover:bg-amber-700 transition-colors text-black"
            >
              VIP
            </button>
            <button 
              onClick={deleteSelectedSeats}
              className="px-2 py-1 text-xs rounded bg-red-600 hover:bg-red-700 transition-colors flex items-center"
            >
              <Trash2 size={12} className="mr-1" />
              Delete
            </button>
          </div>
        </div>
      )}
      
      <div className="px-4 py-3 bg-gray-750 border-t border-gray-700">
        <button 
          className="flex items-center justify-between w-full text-sm font-medium text-gray-300 hover:text-white transition-colors"
          onClick={() => setShowInfo(prev => !prev)}
        >
          <span className="flex items-center">
            <Key size={16} className="mr-2 text-gray-400" />
            Keyboard Shortcuts
          </span>
          {showInfo ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        
        {showInfo && (
          <div className="mt-3 space-y-2 text-xs">
            <p className="flex justify-between">
              <span className="text-gray-400">Delete</span>
              <span>Remove selected</span>
            </p>
            <p className="flex justify-between">
              <span className="text-gray-400">1, 2, 3, 4</span>
              <span>Change seat type</span>
            </p>
            <p className="flex justify-between">
              <span className="text-gray-400">Arrow keys</span>
              <span>Move seats</span>
            </p>
            <p className="flex justify-between">
              <span className="text-gray-400">Ctrl+Z / Ctrl+Y</span>
              <span>Undo / Redo</span>
            </p>
            <p className="flex justify-between">
              <span className="text-gray-400">?</span>
              <span>Show all shortcuts</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeatPalette;