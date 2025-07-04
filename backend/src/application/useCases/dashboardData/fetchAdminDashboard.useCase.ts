// src/application/useCases/adminDashboard/fetchAdminDashboard.useCase.ts
import { injectable, inject } from 'tsyringe';
import { AdminDashboardData } from '../../../domain/entities/adminDashboard.entity';
import { IAdminDashboardRepository } from '../../../domain/interfaces/repositories/adminDashboard.repository';
import { AdminDashboardQueryParams } from '../../../domain/interfaces/model/adminDashboard.interface';
import { IFetchAdminDashboardUseCase } from '../../../domain/interfaces/useCases/Admin/adminDashboard.interface';

@injectable()
export class FetchAdminDashboardUseCase implements IFetchAdminDashboardUseCase {
  constructor(
    @inject('AdminDashboardRepository') private dashboardRepository: IAdminDashboardRepository,
  ) {}

  async execute(adminId: string, params: AdminDashboardQueryParams): Promise<AdminDashboardData> {
    const data = await this.dashboardRepository.getDashboardData(adminId, params);
    return AdminDashboardData.fromMongo(data);
  }
}
