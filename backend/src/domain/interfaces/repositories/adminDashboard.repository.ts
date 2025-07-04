// src/domain/interfaces/repositories/adminDashboard.repository.ts
import {
  AdminStatistics,
  SalesData,
  TopTheater,
  TopShow,
  TheaterStatus,
  AdminDashboardQueryParams,
} from '../model/adminDashboard.interface';

export interface IAdminDashboardRepository {
  getDashboardData(
    adminId: string,
    params: AdminDashboardQueryParams,
  ): Promise<{
    statistics: AdminStatistics;
    sales: SalesData[];
    topTheaters: TopTheater[];
    topShows: TopShow[];
    theaterStatus: TheaterStatus[];
  }>;
}
