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
  movie: Movie;
  theater: Theater;
  showDetails: ShowDetails;
  seats: Seat[];
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





