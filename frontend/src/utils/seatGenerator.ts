// import { TEMPLATES, TemplateType } from '../constants/templates';
// import { SEAT_TYPES } from '../constants/seatTypes';
// import { Seat, SeatLayout } from '../types/theater';

// export const generateSeats = (templateType: TemplateType): SeatLayout => {
//   const template = TEMPLATES[templateType];
  
//   if (templateType === 'EMPTY' || !template) {
//     return [];
//   }

//   const { rows, cols, curve } = template;
//   const layout: SeatLayout = [];

//   for (let i = 0; i < rows; i++) {
//     const rowArray: (Seat | null)[] = [];
//     const rowChar = String.fromCharCode(65 + i);
    
//     // Calculate how many seats to offset from each side for curved layout
//     const curveOffset = curve ? Math.floor(Math.sin((i / rows) * Math.PI) * 3) : 0;
    
//     for (let j = 0; j < cols; j++) {
//       // For curved layouts, add empty spaces at the beginning and end of rows
//       if (curve && (j < curveOffset || j >= cols - curveOffset)) {
//         rowArray.push(null);
//         continue;
//       }
      
//       // Determine seat type based on position
//       let seatType: keyof typeof SEAT_TYPES = 'REGULAR';
      
//       // Premium seats in the middle section
//       if (j >= Math.floor(cols * 0.3) && j < Math.floor(cols * 0.7) && 
//           i >= Math.floor(rows * 0.3) && i < Math.floor(rows * 0.7)) {
//         seatType = 'PREMIUM';
//       }
      
//       // VIP seats in the center-back
//       if (j >= Math.floor(cols * 0.4) && j < Math.floor(cols * 0.6) && 
//           i >= Math.floor(rows * 0.6) && i < Math.floor(rows * 0.8)) {
//         seatType = 'VIP';
//       }
      
//       // Unavailable seats (e.g., for aisles or obstacles)
//       if ((cols > 8 && j === Math.floor(cols / 2) - 1) || 
//           (cols > 8 && j === Math.floor(cols / 2) + (cols % 2 === 0 ? 0 : 1))) {
//         seatType = 'UNAVAILABLE';
//       }
      
//       const seat: Seat = {
//         id: `seat-${i}-${j}`,
//         row: i,
//         col: j,
//         type: seatType,
//         price: SEAT_TYPES[seatType].price,
//         label: `${rowChar}${j + 1}`,
//         occupied: false,
//       };
      
//       rowArray.push(seat);
//     }
    
//     layout.push(rowArray);
//   }
  
//   return layout;
// };

// export const calculateTotalRevenue = (layout: SeatLayout): number => {
//   let revenue = 0;
//   layout.forEach(row => {
//     if (row) {
//       row.forEach(seat => {
//         if (seat && !seat.occupied && seat.type !== 'UNAVAILABLE') {
//           revenue += seat.price;
//         }
//       });
//     }
//   });
//   return revenue;
// };

// export const calculateTotalCapacity = (layout: SeatLayout): number => {
//   let capacity = 0;
//   layout.forEach(row => {
//     if (row) {
//       row.forEach(seat => {
//         if (seat && seat.type !== 'UNAVAILABLE') {
//           capacity++;
//         }
//       });
//     }
//   });
//   return capacity;
// };

import { TEMPLATES, TemplateType } from '../constants/templates';
import { SEAT_TYPES } from '../constants/seatTypes';
import { Seat, SeatLayout } from '../types/theater';

export const generateSeats = (templateType: TemplateType): SeatLayout => {
  const template = TEMPLATES[templateType];
  
  if (templateType === 'EMPTY' || !template) {
    return [];
  }

  const { rows, cols, curve } = template;
  const layout: SeatLayout = [];

  for (let i = 0; i < rows; i++) {
    const rowArray: (Seat | null)[] = [];
    const rowChar = String.fromCharCode(65 + i);
    
    // Calculate how many seats to offset from each side for curved layout
    const curveOffset = curve ? Math.floor(Math.sin((i / rows) * Math.PI) * 3) : 0;
    
    for (let j = 0; j < cols; j++) {
      // For curved layouts, add empty spaces at the beginning and end of rows
      if (curve && (j < curveOffset || j >= cols - curveOffset)) {
        rowArray.push(null);
        continue;
      }
      
      // Determine seat type based on position
      let seatType: keyof typeof SEAT_TYPES = 'REGULAR';
      
      // Premium seats in the middle section
      if (j >= Math.floor(cols * 0.3) && j < Math.floor(cols * 0.7) && 
          i >= Math.floor(rows * 0.3) && i < Math.floor(rows * 0.7)) {
        seatType = 'PREMIUM';
      }
      
      // VIP seats in the center-back
      if (j >= Math.floor(cols * 0.4) && j < Math.floor(cols * 0.6) && 
          i >= Math.floor(rows * 0.6) && i < Math.floor(rows * 0.8)) {
        seatType = 'VIP';
      }
      
      // Unavailable seats (e.g., for aisles or obstacles)
      if ((cols > 8 && j === Math.floor(cols / 2) - 1) || 
          (cols > 8 && j === Math.floor(cols / 2) + (cols % 2 === 0 ? 0 : 1))) {
        seatType = 'UNAVAILABLE';
      }
      
      const seat: Seat = {
        id: `seat-${i}-${j}`,
        row: i,
        col: j,
        type: seatType,
        price: SEAT_TYPES[seatType].price,
        label: `${rowChar}${j + 1}`,
        occupied: false,
      };
      
      rowArray.push(seat);
    }
    
    layout.push(rowArray);
  }
  
  return layout;
};

export const calculateTotalRevenue = (layout: SeatLayout): number => {
  let revenue = 0;
  layout.forEach(row => {
    if (row) {
      row.forEach(seat => {
        if (seat && !seat.occupied && seat.type !== 'UNAVAILABLE') {
          revenue += seat.price;
        }
      });
    }
  });
  return revenue;
};

export const calculateTotalCapacity = (layout: SeatLayout): number => {
  let capacity = 0;
  layout.forEach(row => {
    if (row) {
      row.forEach(seat => {
        if (seat && seat.type !== 'UNAVAILABLE') {
          capacity++;
        }
      });
    }
  });
  return capacity;
};

export const findSeatById = (layout: SeatLayout, id: string): { seat: Seat | null, rowIndex: number, colIndex: number } => {
  for (let i = 0; i < layout.length; i++) {
    const row = layout[i];
    if (!row) continue;
    for (let j = 0; j < row.length; j++) {
      if (row[j]?.id === id) {
        return { seat: row[j], rowIndex: i, colIndex: j };
      }
    }
  }
  return { seat: null, rowIndex: -1, colIndex: -1 };
};