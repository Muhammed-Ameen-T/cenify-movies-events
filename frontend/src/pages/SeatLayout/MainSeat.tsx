import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TheaterProvider } from './TheaterContext';
import SetupForm from './SetupForm';
import TheaterEditor from './TheaterEditor';

function SeatLayoutMain() {
  const [setupCompleted, setSetupCompleted] = useState(false);

  return (
    <DndProvider backend={HTML5Backend}>
      <TheaterProvider>
        <div className="min-h-screen bg-[#1E1E2D] text-gray-100">
          {!setupCompleted ? (
            <SetupForm onComplete={() => setSetupCompleted(true)} />
          ) : (
            <TheaterEditor />
          )}
        </div>
      </TheaterProvider>
    </DndProvider>
  );
}

export default SeatLayoutMain;