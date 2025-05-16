import React from 'react';
import { Group, Rect, Text } from 'react-konva';
import { SeatType } from '../../types/theater';
import { SEAT_TYPES } from '../../constants/seatTypes';

interface PaletteItemProps {
  type: SeatType;
  x: number;
  y: number;
  size: number;
  onDragStart: (type: SeatType) => void;
}

const PaletteItem: React.FC<PaletteItemProps> = ({ 
  type, 
  x, 
  y, 
  size, 
  onDragStart 
}) => {
  const seatColor = SEAT_TYPES[type].color;
  const price = SEAT_TYPES[type].price;
  
  return (
    <Group
      x={x}
      y={y}
      width={size}
      height={size + 25}
      draggable
      onDragStart={() => onDragStart(type)}
    >
      {/* Seat */}
      <Rect
        width={size}
        height={size}
        fill={seatColor}
        cornerRadius={[5, 5, 0, 0]}
      />
      
      {/* Seat type label */}
      <Text
        text={SEAT_TYPES[type].name}
        fontSize={10}
        fontFamily="Arial"
        fill="white"
        align="center"
        width={size}
        y={size + 5}
      />
      
      {/* Price label */}
      <Text
        text={`₹${price}`}
        fontSize={9}
        fontFamily="Arial"
        fill="#CBD5E1"
        align="center"
        width={size}
        y={size + 18}
      />
    </Group>
  );
};

export default PaletteItem;