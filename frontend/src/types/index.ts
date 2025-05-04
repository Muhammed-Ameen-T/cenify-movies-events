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