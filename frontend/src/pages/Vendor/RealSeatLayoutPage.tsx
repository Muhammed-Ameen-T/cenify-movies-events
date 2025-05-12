import { useState } from 'react';
import TheaterLayoutCustomizer from './SeatLayout';

function Appii() {
  const [darkMode, setDarkMode] = useState(true);
  
  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#1E1E2D] text-white' : 'bg-gray-100 text-gray-800'}`}>
      <TheaterLayoutCustomizer 
        initialDarkMode={darkMode}
        onDarkModeChange={setDarkMode}
      />
    </div>
  );
}

export default Appii;