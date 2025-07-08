// src/domain/entities/dashboard.entity.ts
import { Types } from 'mongoose';
import {
  VendorStatistics,
  MonthlyRevenue,
  OccupancyRate,
  TopSellingShow,
  TopTheater,
} from '../interfaces/model/vendorDashboard.interface';

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
    monthlyRevenue: any[];
    occupancyRate: any[];
    topSellingShows: any[];
    topTheaters: any[];
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
        id: new Types.ObjectId(s.id),
        title: s.title,
        tickets: s.tickets,
        revenue: Number(s.revenue.toFixed(2)),
      })),
      data.topTheaters.map((t) => ({
        id: new Types.ObjectId(t.id),
        name: t.name,
        tickets: t.tickets,
        revenue: Number(t.revenue.toFixed(2)),
        occupancyRate: Number(t.occupancyRate.toFixed(2)),
      })),
    );
  }
}
