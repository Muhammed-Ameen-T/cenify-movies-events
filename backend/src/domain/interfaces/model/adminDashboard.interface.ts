// src/domain/interfaces/model/adminDashboard.interface.ts
import { Types } from 'mongoose';

export interface AdminStatistics {
  totalRevenue: number; // Total amount from confirmed bookings
  totalBookings: number; // Total booked seats (tickets sold)
  totalTheaters: number; // Count of all theaters
  averageRating: number; // Average theater rating
}

export interface SalesData {
  name: string; // e.g., "Jan 2025" (monthly), "2025-06-01" (daily), "2025" (annually)
  revenue: number; // Revenue for the period
}

export interface TopTheater {
  id: Types.ObjectId; // Theater ID
  name: string; // Theater name
  location: string; // City, State
  revenue: number; // Total revenue
  bookings: number; // Total booked seats
  rating: number; // Theater rating
  growth: number; // % revenue growth vs previous period
  rank: number; // 1 to 5
}

export interface TopShow {
  id: Types.ObjectId; // Show ID
  title: string; // Movie name
  genre: string; // Joined genres, e.g., "Action, Sci-Fi"
  duration: string; // Formatted, e.g., "2h 31m"
  rating: number; // Movie rating
  bookings: number; // Total booked seats
  revenue: number; // Total revenue
  poster: string; // Movie poster URL
  isHot: boolean; // Based on recent popularity
}

export interface TheaterStatus {
  name: string; // "Verified", "Verifying", "Blocked", "Pending"
  value: number; // Count of theaters
  color: string; // Hex color for chart
}

export interface AdminDashboardData {
  statistics: AdminStatistics;
  sales: SalesData[];
  topTheaters: TopTheater[];
  topShows: TopShow[];
  theaterStatus: TheaterStatus[];
}

export interface AdminDashboardQueryParams {
  period?: 'daily' | 'monthly' | 'annually'; // Time aggregation
  startDate?: string; // ISO date
  endDate?: string; // ISO date
  location?: string; // City name
}
