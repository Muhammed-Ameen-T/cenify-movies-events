import { Booking } from '../../../entities/booking.entity';

export interface IFetchAllBookingsUseCase {
  execute(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    bookings: Booking[];
    totalCount: number;
    totalPages: number;
  }>;
}
