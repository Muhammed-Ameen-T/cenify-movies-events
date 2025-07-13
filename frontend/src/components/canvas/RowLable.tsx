import React from 'react';
import { Group, Text } from 'react-konva';

interface RowLabelProps {
  row: number;
  x: number;
  y: number;
  darkMode: boolean;
}

const RowLabel: React.FC<RowLabelProps> = ({ row, x, y, darkMode }) => {
  const rowLabel = String.fromCharCode(65 + row);
  const textColor = darkMode ? '#9CA3AF' : '#4B5563';
  
  return (
    <Group x={x} y={y}>
      <Text
        text={rowLabel}
        fontSize={12}
        fontFamily="Arial"
        fill={textColor}
        align="center"
        verticalAlign="middle"
        width={20}
        height={20}
      />
    </Group>
  );
};

export default RowLabel;