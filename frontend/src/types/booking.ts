import { ITheater } from "./theater";

export interface Seat {
  seatId: string;
  seatNumber: string;
  type: string;
  price: number;
}

export interface Movie {
  name: string;
  rating: number;
  duration: { hours: number; minutes: number };
}

export interface Theater {
  name: string;
  location: string;
}

export interface ShowDetails {
  date: string;
  time: string;
}

export interface BookingData {
  _id: string;
  movieId: Movie;
  theaterId: Theater;
  screenId: Screen;
  showDate: string; // ISO date string
  startTime: string; // ISO date string
  endTime: string; // ISO date string
  status: 'Running' | 'Scheduled' | 'Completed'; // Extend as needed
  vendorId: string;
  bookedSeats: Seat[];
}

export interface PaymentOptions {
  wallet: {
    enabled: boolean;
    balance: number;
  };
  stripe: {
    enabled: boolean;
  };
  moviePass: {
    active: boolean;
  };
}

export interface CreateBookingPayload {
  showId: string;
  bookedSeatsId: string[];
  payment: {
    amount: number;
    method: 'wallet' | 'stripe';
  };
  subTotal: number;
  convenienceFee: number;
  donation: number;
  totalAmount: number;
  couponDiscount: number;
  couponApplied: boolean;
  moviePassApplied: boolean;
  moviePassDiscount: number;
}

export interface CreateBookingResponse {
  booking: {
    bookingId: string;
  };
  stripeSessionUrl?: string;
}





