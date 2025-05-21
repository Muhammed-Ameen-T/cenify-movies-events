import { SeatLayout, Seat } from '../../entities/seatLayout.entity';

export interface ISeatLayoutRepository {
  create(seatLayout: SeatLayout): Promise<SeatLayout>;
  createSeats(seats: Seat[]): Promise<Seat[]>;
  findByVendor(params: {
    vendorId: string;
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ seatLayouts: any[]; totalCount: number }>;
}