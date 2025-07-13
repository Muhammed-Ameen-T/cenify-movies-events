import {
  DashboardQueryParams,
  VendorStatistics,
  MonthlyRevenue,
  OccupancyRate,
  TopSellingShow,
  TopTheater,
} from '../model/vendorDashboard.interface';

export interface IDashboardRepository {
  getDashboardData(
    vendorId: string,
    params: DashboardQueryParams,
  ): Promise<{
    statistics: VendorStatistics;
    monthlyRevenue: MonthlyRevenue[];
    occupancyRate: OccupancyRate[];
    topSellingShows: TopSellingShow[];
    topTheaters: TopTheater[];
  }>;
}
