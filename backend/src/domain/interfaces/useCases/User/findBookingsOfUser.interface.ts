import { Booking } from '../../../entities/booking.entity';

export interface IFindBookingsOfUserUseCase {
  execute(params: {
    userId: string;
    page?: number;
    limit?: number;
    status?: string[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ bookings: Booking[]; totalCount: number; totalPages: number }>;
}
