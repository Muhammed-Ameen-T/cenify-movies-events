export interface BookingData {
  bookingId: string;
  transactionId: string;
  movie: {
    id: string;
    name: string;
    poster: string;
    genre: string[];
    rating: number;
    duration: {
      hours: number;
      minutes: number;
      seconds?: number;
    };
    language: string;
    certification: string;
  };
  theater: {
    name: string;
    screen: string;
    city: string;
  };
  showtime: {
    date: string;
    time: string;
    day: string;
  };
  seats: { number: string }[];
  pricing: {
    ticketPrice: number;
    convenienceFee: number;
    taxes: number;
    total: number;
  };
  user: {
    name: string;
    email: string;
    phone: string;
  };
  paymentMethod: string;
  bookingTime: string;
  qrCode: string;
}

export interface PaymentOptions {
  wallet: { enabled: boolean; balance: number };
  stripe: { enabled: boolean };
  moviePass: { active: boolean };
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
  _id: string;
  showId: {
    _id: string;
    startTime: string;
    endTime: string;
    movieId: {
      _id: string;
      name: string;
      genre: string[];
      trailer: string;
      rating: number;
      poster: string;
      duration: { hours: number; minutes: number; seconds: number };
      description: string;
      language: string;
      releaseDate: string;
      status: string;
      likes: number;
      interests: number;
      is3D: boolean;
      crew: { id: string; name: string; role: string; profileImage: string; _id: string }[];
      cast: { id: string; name: string; as: string; profileImage: string; _id: string }[];
      reviews: any[];
      createdAt: string;
      updatedAt: string;
    };
    theaterId: {
      _id: string;
      screens: string[];
      name: string;
      status: string;
      location: { city: string; coordinates: number[]; type: string };
      facilities: { foodCourt: boolean; lounges: boolean; mTicket: boolean; parking: boolean; freeCancellation: boolean };
      intervalTime: number;
      gallery: string[];
      email: string;
      phone: number;
      description: string;
      vendorId: string;
      rating: number;
      createdAt: string;
      updatedAt: string;
    };
    screenId: string;
    status: string;
    vendorId: string;
    showDate: string;
    bookedSeats: {
      date: string;
      isPending: boolean;
      seatNumber: string;
      seatPrice: number;
      type: string;
      position: { row: number; col: number };
      userId: string;
      _id: string;
    }[];
    createdAt: string;
    updatedAt: string;
  };
  userId: {
    _id: string;
    name: string;
    email: string;
    phone: number;
    authId: string;
    password: string | null;
    profileImage: string;
    dob: string | null;
    moviePass: any;
    loyalityPoints: number;
    isBlocked: boolean;
    role: string;
    createdAt: string;
    updatedAt: string;
  };
  bookedSeatsId: string[];
  bookingId: string;
  status: string;
  payment: {
    amount: number;
    method: string;
    status: string;
    paymentId: string;
  };
  qrCode: string;
  subTotal: number;
  couponDiscount: number;
  couponApplied: boolean;
  convenienceFee: number;
  donation: number;
  moviePassApplied: boolean;
  moviePassDiscount: number;
  totalDiscount: number;
  totalAmount: number;
  offerDiscount: number;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}


export interface Booking {
  id: string;
  bookingId: string;
  movieTitle: string;
  poster: string;
  theater: string;
  status: string;
  date: string;
  time: string;
  seats: string[];
  totalAmount: number;
  upcoming: boolean;
  qrCode?: string;
  duration: string;
  genre?: string[];
  rating?: string;
  screen?: string;
  paymentId?: string;
  showId: string;
  userId: string;
  paymentStatus?: string;
  createdAt: string;
  reason:string
}

export interface BookingResponse {
  bookings: Booking[];
  totalCount: number;
  totalPages: number;
}