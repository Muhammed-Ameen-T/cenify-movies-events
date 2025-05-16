import React from 'react';
import { Group, Rect, Text } from 'react-konva';

interface ScreenComponentProps {
  stageWidth: number;
  darkMode: boolean;
}

const ScreenComponent: React.FC<ScreenComponentProps> = ({ stageWidth, darkMode }) => {
  const screenWidth = stageWidth * 0.7;
  const screenHeight = 40;
  const x = (stageWidth - screenWidth) / 2;

  return (
    <Group>
      {/* Main screen */}
      <Rect
        x={x}
        y={20}
        width={screenWidth}
        height={screenHeight}
        fill={darkMode ? '#374151' : '#D1D5DB'}
        shadowColor="black"
        shadowBlur={10}
        shadowOffsetY={3}
        shadowOpacity={0.3}
        cornerRadius={[20, 20, 0, 0]}
      />
      
      {/* Screen label */}
      <Group x={stageWidth / 2} y={40}>
        <Rect
          x={-35}
          y={-12}
          width={70}
          height={24}
          fill={darkMode ? '#1F2937' : '#9CA3AF'}
          cornerRadius={6}
        />
        <Text
          text="SCREEN"
          fontSize={14}
          fontFamily="Arial"
          fill="white"
          align="center"
          verticalAlign="middle"
          width={70}
          height={24}
          x={-35}
          y={-12}
        />
      </Group>
      
      {/* Direction text */}
      <Text
        text="👀 All eyes this way 👀"
        fontSize={14}
        fontFamily="Arial"
        fill={darkMode ? '#9CA3AF' : '#4B5563'}
        align="center"
        width={stageWidth}
        y={70}
      />
    </Group>
  );
};

export default ScreenComponent;