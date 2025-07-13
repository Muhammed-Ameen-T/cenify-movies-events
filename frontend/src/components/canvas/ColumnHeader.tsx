import React from 'react';
import { Group, Rect, Text } from 'react-konva';

interface ColumnHeaderProps {
  col: number;
  x: number;
  y: number;
  width: number;
  height: number;
  selected: boolean;
  darkMode: boolean;
  onClick: (col: number) => void;
}

const ColumnHeader: React.FC<ColumnHeaderProps> = ({ 
  col, 
  x, 
  y, 
  width, 
  height, 
  selected, 
  darkMode, 
  onClick 
}) => {
  const backgroundColor = selected 
    ? '#3B82F6' 
    : darkMode 
      ? '#323248' 
      : '#D1D5DB';
      
  const textColor = selected ? 'white' : darkMode ? '#E5E7EB' : '#1F2937';
  
  return (
    <Group
      x={x}
      y={y}
      onClick={() => onClick(col)}
    >
      <Rect
        width={width}
        height={height}
        fill={backgroundColor}
        cornerRadius={3}
      />
      <Text
        text={String(col + 1)}
        fontSize={10}
        fontFamily="Arial"
        fill={textColor}
        align="center"
        verticalAlign="middle"
        width={width}
        height={height}
      />
    </Group>
  );
};

export default ColumnHeader;