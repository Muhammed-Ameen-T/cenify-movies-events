export type SeatType = 'regular' | 'premium' | 'vip' | 'unavailable';

export interface SeatPrice {
  regular: number;
  premium: number;
  vip: number;
}

export interface Seat {
  id: string;
  type: SeatType;
  row: number;
  column: number;
  number: string;
}

export interface TheaterLayout {
  id: string;
  name: string;
  prices: SeatPrice;
  seats: Seat[];
  rowCount: number;
  columnCount: number;
}

export interface Position {
  row: number;
  column: number;
}

export interface DragItem {
  type: string;
  seatType: SeatType;
  id?: string;
  sourceIndex?: number;
  position?: Position;
}

export interface SelectedSeats {
  [key: string]: boolean;
}

export interface TheaterTemplate {
  name: string;
  description: string;
  rows: number;
  columns: number;
  seats: Array<{
    type: SeatType;
    row: number;
    column: number;
  }>;
}