  export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
  }
  
  export interface Theater {
    id: string;
    name: string;
    location: string;
    capacity: number;
    description: string;
    image: string;
    status: 'active' | 'inactive' | 'maintenance';
    amenities: string[];
    createdAt: string;
  }
  
  export interface Show {
    id: string;
    title: string;
    description: string;
    theaterId: string;
    theaterName: string;
    startDate: string;
    endDate: string;
    duration: number;
    image: string;
    price: {
      standard: number;
      premium?: number;
      vip?: number;
    };
    status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
    tags: string[];
    createdAt: string;
  }
  
  export interface Event {
    id: string;
    title: string;
    description: string;
    type: 'movie' | 'concert' | 'theater' | 'other';
    startDate: string;
    endDate: string;
    location: string;
    status: 'draft' | 'published' | 'cancelled';
    image: string;
    capacity: number;
    ticketsSold: number;
    revenue: number;
    tags: string[];
    createdAt: string;
  }
  
  export interface Booking {
    id: string;
    userId: string;
    userName: string;
    showId: string;
    showTitle: string;
    theaterId: string;
    theaterName: string;
    seats: string[];
    totalAmount: number;
    status: 'confirmed' | 'cancelled' | 'pending';
    bookedAt: string;
  }
  
  export interface Statistics {
    totalRevenue: number;
    ticketsSold: number;
    activeShows: number;
    averageOccupancy: number;
    revenuePerShow: {
      name: string;
      value: number;
    }[];
    monthlyRevenue: {
      name: string;
      value: number;
    }[];
    topSellingShows: {
      id: string;
      title: string;
      tickets: number;
      revenue: number;
    }[];
    occupancyRate: {
      name: string;
      rate: number;
    }[];
  }
  
  export interface TableFilter {
    search: string;
    status: string[];
    dateRange: {
      start: string | null;
      end: string | null;
    };
    sort: {
      field: string;
      direction: 'asc' | 'desc';
    };
  }

export interface Transaction {
  id: string;
  amount: number;
  remark?: string;
  type: 'credit' | 'debit';
  source: 'loyality' | 'refund' | 'topup' | 'booking';
  createdAt: string;
  status: 'completed' | 'pending' | 'failed';
}


export interface WalletTransactionsResponse {
  transactions: Transaction[];
  total: number;
  creditCount: number;
  debitCount: number;
}



  // User profile types
export type TabType = "account" | "bookings" | "notifications" | "rewards" | "wallet" | "moviepass";

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  joinedDate: string;
  loyalityPoints: number;
  profileImage: string;
}

export interface UserResponseDTO {
  id: string;
  name: string;
  email: string;
  phone: number | null;
  role: string;
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
  profileImage?: string;
}

export interface Booking {
  id: string;
  movieTitle: string;
  date: string;
  time: string;
  theater: string;
  seats: string[];
  poster: string;
  upcoming: boolean;
}

// src/types/notification.types.ts

export interface Notification {
  _id: string;
  userId?: string; 
  title: string;
  type: string; 
  description: string; 
  bookingId?: string; 
  createdAt: Date;
  updatedAt: Date;
  isRead: boolean; 
  isGlobal?: boolean;
  readedUsers?: string[]; 
}
export interface NotificationDocument {
  _id: string;
  userId?: string; 
  title: string;
  type: string; 
  description: string; 
  bookingId?: string; 
  createdAt: Date;
  updatedAt: Date;
  isRead: boolean; 
  isGlobal?: boolean;
  readedUsers?: string[]; 
}

export interface PasswordChange {
  oldPassword: string;
  newPassword: string;
}

export interface WalletData {
  balance: number;
  createdAt: Date;
  transactions: {
    amount: number;
    remark: string;
    type: 'debit' | 'credit';
    source: 'loyality' | 'refund' | 'topup' | 'booking';
    createdAt: string;
  }[];
  updatedAt: Date;
  userId: string;
  _id: string;
}