// types.ts
export interface Theater {
    id: number;
    name: string;
    location: string;
    screens: number;
    capacity: number;
    status: 'active' | 'maintenance' | 'blocked';
    images: string[];
    description: string;
  }
  
  export interface DashboardSummary {
    totalTheaters: number;
    activeTheaters: number;
    totalShows: number;
    totalBookings: number;
    revenue: number;
    popularTheaters: { name: string; bookings: number }[];
    popularMovies: { name: string; bookings: number }[];
  }
  