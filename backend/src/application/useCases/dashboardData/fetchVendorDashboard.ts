// src/application/useCases/dashboard/fetchDashboard.useCase.ts
import { injectable, inject } from 'tsyringe';
import { DashboardData } from '../../../domain/entities/vendorDashboard.entity';
import { IDashboardRepository } from '../../../domain/interfaces/repositories/dashboard.repository';
import { DashboardQueryParams } from '../../../domain/interfaces/model/vendorDashboard.interface';
import { IFetchDashboardUseCase } from '../../../domain/interfaces/useCases/Vendor/fetchDashboard.interface';

@injectable()
export class FetchDashboardUseCase implements IFetchDashboardUseCase {
  constructor(@inject('DashboardRepository') private dashboardRepository: IDashboardRepository) {}

  async execute(vendorId: string, params: DashboardQueryParams): Promise<DashboardData> {
    const data = await this.dashboardRepository.getDashboardData(vendorId, params);
    return DashboardData.fromMongo(data);
  }
}
