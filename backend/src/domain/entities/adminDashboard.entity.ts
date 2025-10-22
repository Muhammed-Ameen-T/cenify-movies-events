// src/domain/entities/adminDashboard.entity.ts
import { Types } from 'mongoose';
import {
  AdminStatistics,
  SalesData,
  TopTheater,
  TopShow,
  TheaterStatus,
} from '../interfaces/model/adminDashboard.interface';

// --- RAW DATA INTERFACES (Matching Mongoose Aggregation Output) ---

interface RawSalesData {
  name: string;
  revenue: number;
}

interface RawTopTheater {
  _id: Types.ObjectId | string; // Mongoose result may have '_id' instead of 'id'
  name: string;
  location: string;
  revenue: number;
  bookings: number;
  rating: number;
  growth: number;
  rank?: number; // Optional as it might be added during mapping
}

interface RawTopShow {
  _id: Types.ObjectId | string; // Mongoose result may have '_id' instead of 'id'
  title: string;
  genre: string;
  duration: string;
  rating: number;
  bookings: number;
  revenue: number;
  poster: string;
  isHot: boolean;
}

// Since TheaterStatus structure is simple, we can reuse it, but define the input
type RawTheaterStatus = TheaterStatus;

// -------------------------------------------------------------------

export class AdminDashboardData {
  constructor(
    public statistics: AdminStatistics,
    public sales: SalesData[],
    public topTheaters: TopTheater[],
    public topShows: TopShow[],
    public theaterStatus: TheaterStatus[],
  ) {}

  static fromMongo(data: {
    statistics: AdminStatistics; 
    sales: RawSalesData[];
    topTheaters: RawTopTheater[];
    topShows: RawTopShow[];
    theaterStatus: RawTheaterStatus[];
  }): AdminDashboardData {
    return new AdminDashboardData(
      {
        totalRevenue: Number(data.statistics.totalRevenue.toFixed(2)),
        totalBookings: data.statistics.totalBookings,
        totalTheaters: data.statistics.totalTheaters,
        averageRating: Number(data.statistics.averageRating.toFixed(1)),
      },
      data.sales.map((s) => ({
        name: s.name,
        revenue: Number(s.revenue.toFixed(2)),
      })),
      data.topTheaters.map((t, index) => ({
        // Use t._id as the source for the Types.ObjectId field
        id: new Types.ObjectId(t._id),
        name: t.name,
        location: t.location,
        revenue: Number(t.revenue.toFixed(2)),
        bookings: t.bookings,
        rating: Number(t.rating.toFixed(1)),
        growth: Number(t.growth.toFixed(1)),
        rank: index + 1,
      })),
      data.topShows.map((s) => ({
        // Use s._id as the source for the Types.ObjectId field
        id: new Types.ObjectId(s._id),
        title: s.title,
        genre: s.genre,
        duration: s.duration,
        rating: Number(s.rating.toFixed(1)),
        bookings: s.bookings,
        revenue: Number(s.revenue.toFixed(2)),
        poster: s.poster,
        isHot: s.isHot,
      })),
      data.theaterStatus.map((ts) => ({
        name: ts.name,
        value: ts.value,
        color: ts.color,
      })),
    );
  }
}
