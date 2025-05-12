import { TEMPLATES } from '../constants/templates';
import { SEAT_TYPES } from '../constants/seatTypes';
import { Seat } from '../types/theater';
import { TemplateType } from '../constants/templates';

// Generate initial seat data based on a template
export const generateSeats = (template: TemplateType): Seat[][] => {
  const { rows, cols, pattern } = TEMPLATES[template];
  const seats: Seat[][] = [];

  if (pattern === 'empty') {
    return seats; // Return empty array for empty layout
  }

  for (let row = 0; row < rows; row++) {
    const seatRow: Seat[] = [];
    for (let col = 0; col < cols; col++) {
      // Create different seat patterns based on the template
      let seatType = 'REGULAR' as keyof typeof SEAT_TYPES;
      
      if (pattern === 'curved') {
        // For IMAX: Premium seats in the middle
        if (col >= cols * 0.25 && col < cols * 0.75 && row >= rows * 0.3 && row < rows * 0.7) {
          seatType = 'PREMIUM';
        }
        // VIP seats in the back middle
        if (col >= cols * 0.3 && col < cols * 0.7 && row >= rows * 0.7) {
          seatType = 'VIP';
        }
        // Recliner seats in the back row
        if (row === rows - 1 && col >= cols * 0.3 && col < cols * 0.7) {
          seatType = 'RECLINER';
        }
        // Edge seats might be unavailable
        if ((col < 2 || col >= cols - 2) && (row < 2 || row >= rows - 2)) {
          seatType = 'UNAVAILABLE';
        }
      } else if (pattern === 'premium') {
        // For Premium: Mostly premium with some VIP
        seatType = 'PREMIUM';
        if (row >= rows * 0.6) {
          seatType = 'VIP';
        }
        // Add recliner seats in the back
        if (row === rows - 1) {
          seatType = 'RECLINER';
        }
        // Add accessible seats
        if ((col === 2 || col === cols - 3) && row === rows - 2) {
          seatType = 'DISABLED';
        }
      } else if (pattern === 'multiplex') {
        // Center seats are premium
        if (col >= cols * 0.3 && col < cols * 0.7) {
          seatType = 'PREMIUM';
        }
        // Back rows are VIP
        if (row >= rows * 0.7) {
          seatType = 'VIP';
        }
        // Center back row is recliners
        if (row === rows - 1 && col >= cols * 0.3 && col < cols * 0.7) {
          seatType = 'RECLINER';
        }
        // Add accessible seats
        if ((col === 3 || col === cols - 4) && row === 2) {
          seatType = 'DISABLED';
        }
      }
      
      // Add some accessible seats in standard layout
      if (pattern === 'regular' && row === rows - 1 && (col === 1 || col === cols - 2)) {
        seatType = 'DISABLED';
      }

      const seatId = `seat-${row}-${col}`;
      seatRow.push({
        id: seatId,
        row,
        col,
        type: seatType,
        price: SEAT_TYPES[seatType].price,
        label: `${String.fromCharCode(65 + row)}${col + 1}`,
        occupied: false
      });
    }
    seats.push(seatRow);
  }
  return seats;
};