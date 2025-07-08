import { Theater } from '../../../entities/theater.entity';

export interface IFetchTheaterOfVendorUseCase {
  execute(params?: {
    vendorId: string;
    page?: number;
    limit?: number;
    search?: string;
    status?: string[];
    location?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    theaters: Theater[];
    totalCount: number;
    totalPages: number;
  }>;
}
