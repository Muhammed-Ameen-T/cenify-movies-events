import React from 'react';
import { useTheater } from './TheaterContext';
import SeatPalette from './SeatPallet';
import TheaterCanvas from './TheaterCanvas';
import TheaterStats from './TheaterStats';

const TheaterEditor: React.FC = () => {
  const { currentLayout } = useTheater();
  
  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-400">
            Theater Layout Creator
          </h1>
          <div className="text-lg font-medium">
            {currentLayout?.name}
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col p-4 space-y-6 overflow-y-auto">
          <SeatPalette />
          <TheaterStats />
        </div>
        
        {/* Main canvas */}
        <div className="flex-1 overflow-hidden">
          <TheaterCanvas />
        </div>
      </div>
    </div>
  );
};

export default TheaterEditor;