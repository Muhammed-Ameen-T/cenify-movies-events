import { Booking } from '../../../entities/booking.entity';

export interface IFindBookingsOfVendorUseCase {
  execute(params: {
    vendorId: string;
    page?: number;
    limit?: number;
    status?: string[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ bookings: Booking[]; totalCount: number; totalPages: number }>;
}
