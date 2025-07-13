// src/domain/interfaces/useCases/Admin/adminDashboard.interface.ts
import { AdminDashboardData } from '../../../entities/adminDashboard.entity';
import { AdminDashboardQueryParams } from '../../model/adminDashboard.interface';

export interface IFetchAdminDashboardUseCase {
  execute(adminId: string, params: AdminDashboardQueryParams): Promise<AdminDashboardData>;
}
