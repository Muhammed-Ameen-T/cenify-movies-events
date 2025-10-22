// src/domain/entities/dashboard.entity.ts
import { Types } from 'mongoose';
import {
  VendorStatistics,
  MonthlyRevenue,
  OccupancyRate,
  TopSellingShow,
  TopTheater,
} from '../interfaces/model/vendorDashboard.interface';

// --- RAW DATA INTERFACES (Representing Mongoose/Aggregation Output) ---

// MonthlyRevenue structure is simple enough to use directly, but ensure properties exist
type RawMonthlyRevenue = {
  name: string;
  value: number;
};

// OccupancyRate structure is simple enough to use directly, but ensure properties exist
type RawOccupancyRate = {
  name: string;
  rate: number;
};

// TopSellingShow expects 'id' to be convertible to ObjectId
interface RawTopSellingShow {
  id: Types.ObjectId | string; // ID field from aggregation
  title: string;
  tickets: number;
  revenue: number;
  showTime: Date | string; // Mongoose aggregation returns Date, but map uses new Date()
}

// TopTheater expects 'id' to be convertible to ObjectId
interface RawTopTheater {
  id: Types.ObjectId | string; // ID field from aggregation
  name: string;
  tickets: number;
  revenue: number;
  occupancyRate: number;
}

// ----------------------------------------------------------------------

export class DashboardData {
  constructor(
    public statistics: VendorStatistics,
    public monthlyRevenue: MonthlyRevenue[],
    public occupancyRate: OccupancyRate[],
    public topSellingShows: TopSellingShow[],
    public topTheaters: TopTheater[],
  ) {}

  static fromMongo(data: {
    statistics: VendorStatistics; 
    monthlyRevenue: RawMonthlyRevenue[];
    occupancyRate: RawOccupancyRate[];
    topSellingShows: RawTopSellingShow[];
    topTheaters: RawTopTheater[];
  }): DashboardData {
    return new DashboardData(
      {
        totalRevenue: data.statistics.totalRevenue,
        ticketsSold: data.statistics.ticketsSold,
        activeShows: data.statistics.activeShows,
        averageOccupancy: Number(data.statistics.averageOccupancy.toFixed(2)),
      },
      data.monthlyRevenue.map((r) => ({
        name: r.name,
        value: Number(r.value.toFixed(2)),
      })),
      data.occupancyRate.map((o) => ({
        name: o.name,
        rate: Number(o.rate.toFixed(2)),
      })),
      data.topSellingShows.map((s) => ({
        // Casts the raw ID to Types.ObjectId for the domain entity
        id: new Types.ObjectId(s.id),
        title: s.title,
        tickets: s.tickets,
        revenue: Number(s.revenue.toFixed(2)),
        showTime: new Date(s.showTime),
      })),
      data.topTheaters.map((t) => ({
        // Casts the raw ID to Types.ObjectId for the domain entity
        id: new Types.ObjectId(t.id),
        name: t.name,
        tickets: t.tickets,
        revenue: Number(t.revenue.toFixed(2)),
        occupancyRate: Number(t.occupancyRate.toFixed(2)),
      })),
    );
  }
}
