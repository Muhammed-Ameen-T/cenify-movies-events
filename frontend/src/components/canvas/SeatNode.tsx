import React from 'react';
import { Group, Rect, Text } from 'react-konva';
import { Seat } from '../../types/theater';
import { SEAT_TYPES } from '../../constants/seatTypes';

interface SeatNodeProps {
  seat: Seat;
  selected: boolean;
  size: number;
  onClick: (seat: Seat) => void;
  onRightClick: (seat: Seat) => void;
}

const SeatNode: React.FC<SeatNodeProps> = ({ 
  seat, 
  selected, 
  size, 
  onClick, 
  onRightClick
}) => {
  const seatColor = SEAT_TYPES[seat.type].color;
  
  return (
    <Group
      x={seat.x || 0}
      y={seat.y || 0}
      width={size}
      height={size}
      onClick={() => onClick(seat)}
      onContextMenu={(e) => {
        e.evt.preventDefault();
        onRightClick(seat);
      }}
    >
      {/* Selection highlight */}
      {selected && (
        <Rect
          x={-2}
          y={-2}
          width={size + 4}
          height={size + 4}
          stroke="white"
          strokeWidth={2}
          cornerRadius={[5, 5, 0, 0]}
        />
      )}
      
      {/* Seat body */}
      <Rect
        width={size}
        height={size}
        fill={seatColor}
        opacity={seat.occupied ? 0.5 : 1}
        cornerRadius={[5, 5, 0, 0]}
        perfectDrawEnabled={false}
      />
      
      {/* Seat label */}
      <Text
        text={seat.label}
        fontSize={10}
        fontFamily="Arial"
        fill="white"
        align="center"
        verticalAlign="middle"
        width={size}
        height={size}
        fontStyle="bold"
        shadowColor="black"
        shadowBlur={2}
        shadowOpacity={0.3}
      />
    </Group>
  );
};

export default SeatNode;