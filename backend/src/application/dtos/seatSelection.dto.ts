// src/application/dtos/seatSelection.dto.ts
export interface SeatDTO {
  id: string;
  number: string;
  type: 'VIP' | 'Regular' | 'Premium' | 'Unavailable';
  price: number;
  status: 'available' | 'booked' | 'pending' | 'unavailable';
  position: {
    row: number;
    col: number;
  };
}

export interface SeatSelectionResponseDTO {
  seats: SeatDTO[];
  seatLayout: {
    rowCount: number;
    columnCount: number;
    capacity: number;
    seatPrices: {
      regular: number;
      premium: number;
      vip: number;
    };
  };
  showDetails: {
    showId: string;
    movieTitle: string;
    movieId: string;
    theaterName: string;
    theaterCity: string;
    screenName: string;
    date: string;
    time: string;
  };
}

export interface SelectSeatDTO {
  showId: string;
  seatIds: string[];
  userId: string;
}
