export interface AdminStatistics {
  totalRevenue: number;
  totalBookings: number;
  totalTheaters: number;
  averageRating: number;
}

export interface SalesData {
  name: string;
  revenue: number;
}

export interface TopTheater {
  id: string;
  name: string;
  location: string;
  revenue: number;
  bookings: number;
  rating: number;
  growth: number;
  rank: number;
}

export interface TopShow {
  id: string;
  title: string;
  genre: string;
  duration: string;
  rating: number;
  bookings: number;
  revenue: number;
  poster: string;
  isHot: boolean;
}

export interface TheaterStatus {
  name: string;
  value: number;
  color: string;
}

export interface AdminDashboardData {
  statistics: AdminStatistics;
  sales: SalesData[];
  topTheaters: TopTheater[];
  topShows: TopShow[];
  theaterStatus: TheaterStatus[];
}

export interface AdminDashboardQueryParams {
  period?: 'daily' | 'monthly' | 'annually';
  startDate?: string;
  endDate?: string;
  location?: string;
}