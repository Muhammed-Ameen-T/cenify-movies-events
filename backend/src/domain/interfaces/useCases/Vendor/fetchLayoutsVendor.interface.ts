import { SeatLayout } from "../../../entities/seatLayout.entity";

export interface IFindSeatLayoutsByVendorUseCase {
  execute(params: {
    vendorId: string;
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ seatLayouts: SeatLayout[]; totalCount: number }>;
}
