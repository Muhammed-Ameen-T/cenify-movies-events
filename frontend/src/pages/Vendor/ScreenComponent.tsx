import React from 'react';

interface ScreenComponentProps {
  darkMode: boolean;
}

const ScreenComponent: React.FC<ScreenComponentProps> = ({ darkMode }) => {
  return (
    <div className="flex flex-col items-center mb-12">
      {/* Curved screen effect */}
      <div className="relative w-full max-w-4xl mb-8">
        <div 
          className={`h-24 rounded-t-[100%] ${
            darkMode ? 'bg-gray-800' : 'bg-gray-300'
          } shadow-lg`}
        />
        <div 
          className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 px-8 py-2 
          ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-400 text-white'}
          rounded-t-lg text-sm font-medium`}
        >
          SCREEN
        </div>
      </div>
      
      {/* Direction label */}
      <div 
        className={`text-sm ${
          darkMode ? 'text-gray-400' : 'text-gray-600'
        } italic flex items-center gap-2`}
      >
        <span>👀</span>
        <span>All eyes this way</span>
        <span>👀</span>
      </div>
    </div>
  );
};

export default ScreenComponent;