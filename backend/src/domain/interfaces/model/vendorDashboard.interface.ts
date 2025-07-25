// src/domain/interfaces/model/dashboard.interface.ts
import { Types } from 'mongoose';

export interface VendorStatistics {
  totalRevenue: number; // Sum of totalAmount from confirmed bookings
  ticketsSold: number; // Count of bookedSeatsId across confirmed bookings
  activeShows: number; // Count of shows with status 'Scheduled' or 'Running'
  averageOccupancy: number; // Percentage of booked seats vs total capacity
}

export interface MonthlyRevenue {
  name: string; // e.g., "Jan"
  value: number; // Revenue in USD
}

export interface OccupancyRate {
  name: string; // Theater name
  rate: number; // Occupancy percentage
}

export interface TopSellingShow {
  id: Types.ObjectId; // Show ID
  title: string; // Movie name
  tickets: number; // Number of booked seats
  revenue: number; // Total amount
  showTime: Date; // Start time of the show
}

export interface TopTheater {
  id: Types.ObjectId; // Theater ID
  name: string; // Theater name
  tickets: number; // Number of booked seats
  revenue: number; // Total amount
  occupancyRate: number; // Occupancy percentage
}

export interface VendorDashboardData {
  statistics: VendorStatistics;
  monthlyRevenue: MonthlyRevenue[];
  occupancyRate: OccupancyRate[];
  topSellingShows: TopSellingShow[];
  topTheaters: TopTheater[];
}

export interface DashboardQueryParams {
  startDate?: string; // ISO date, e.g., "2025-01-01"
  endDate?: string; // ISO date
  status?: string; // 'verified', 'verifying', 'pending', 'blocked'
  location?: string; // City name
}
