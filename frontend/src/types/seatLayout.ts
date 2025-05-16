export interface CreateSeatLayoutRequest {
  uuid: string;
  vendorId: string;
  layoutName: string;
  seatPrice: {
    regular: number;
    premium: number;
    vip: number;
  };
  rowCount: number;
  columnCount: number;
  seats: {
    uuid: string;
    type: 'regular' | 'premium' | 'vip' | 'unavailable';
    row: number;
    column: number;
    number: string;
  }[];
}

// Response data type based on backend SeatLayout response
export interface SeatLayoutResponse {
  _id: string;
  uuid: string;
  vendorId: string;
  layoutName: string;
  seatPrice: {
    regular: number;
    premium: number;
    vip: number;
  };
  capacity: number;
  seatIds: string[];
  rowCount: number;
  columnCount: number;
  createdAt: string;
  updatedAt: string;
}

// API response structure
export interface ApiResponse {
  success: boolean;
  message: string;
  data: SeatLayoutResponse;
}