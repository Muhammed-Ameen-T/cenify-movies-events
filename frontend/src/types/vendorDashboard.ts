// src/types/dashboard.ts

export interface VendorStatistics {
  totalRevenue: number;
  ticketsSold: number;
  activeShows: number;
  averageOccupancy: number;
}

export interface MonthlyRevenue {
  name: string;
  value: number;
}

export interface OccupancyRate {
  name: string;
  rate: number;
}

export interface TopSellingShow {
  id: string;
  title: string;
  tickets: number;
  revenue: number;
  showTime: Date;
}

export interface TopTheater {
  id: string;
  name: string;
  tickets: number;
  revenue: number;
  occupancyRate: number;
}

export interface VendorDashboardData {
  statistics: VendorStatistics;
  monthlyRevenue: MonthlyRevenue[];
  occupancyRate: OccupancyRate[];
  topSellingShows: TopSellingShow[];
  topTheaters: TopTheater[];
}

export interface DashboardQueryParams {
  startDate?: string;
  endDate?: string;
  status?: string;
  location?: string;
}