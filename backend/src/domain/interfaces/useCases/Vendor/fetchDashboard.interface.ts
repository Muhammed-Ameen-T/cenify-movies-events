// src/domain/interfaces/useCases/Vendor/dashboard.interface.ts
import { DashboardData } from '../../../entities/vendorDashboard.entity';
import { DashboardQueryParams } from '../../model/vendorDashboard.interface';

export interface IFetchDashboardUseCase {
  execute(vendorId: string, params: DashboardQueryParams): Promise<DashboardData>;
}
