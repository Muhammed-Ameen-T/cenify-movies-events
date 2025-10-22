// src/application/useCases/adminDashboard/fetchAdminDashboard.useCase.ts
import { injectable, inject } from 'tsyringe';
import { AdminDashboardData } from '../../../domain/entities/adminDashboard.entity';
import { IAdminDashboardRepository } from '../../../domain/interfaces/repositories/adminDashboard.repository';
import {
  AdminDashboardQueryParams,
  AdminStatistics,
  TopTheater,
  TopShow,
  TheaterStatus,
} from '../../../domain/interfaces/model/adminDashboard.interface';
import { IFetchAdminDashboardUseCase } from '../../../domain/interfaces/useCases/Admin/adminDashboard.interface';
import { Types } from 'mongoose';

interface RawSalesData {
  name: string;
  revenue: number;
}

interface RawTopTheater {
  _id: Types.ObjectId | string; 
  name: string;
  location: string;
  revenue: number;
  bookings: number;
  rating: number;
  growth: number;
  rank?: number;
}

interface RawTopShow {
  _id: Types.ObjectId | string;
  title: string;
  genre: string;
  duration: string;
  rating: number;
  bookings: number;
  revenue: number;
  poster: string;
  isHot: boolean;
}

interface RawDashboardData {
  statistics: AdminStatistics;
  sales: RawSalesData[];
  topTheaters: RawTopTheater[];
  topShows: RawTopShow[];
  theaterStatus: TheaterStatus[];
}

@injectable()
export class FetchAdminDashboardUseCase implements IFetchAdminDashboardUseCase {
  constructor(
    @inject('AdminDashboardRepository') private _dashboardRepository: IAdminDashboardRepository,
  ) {}

  async execute(adminId: string, params: AdminDashboardQueryParams): Promise<AdminDashboardData> {
    const data = await this._dashboardRepository.getDashboardData(adminId, params);
    return AdminDashboardData.fromMongo(data as unknown as RawDashboardData);
  }
}
