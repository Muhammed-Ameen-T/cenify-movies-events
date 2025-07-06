import { Booking } from '../../entities/booking.entity';

export interface IBookingRepository {
  create(bookingData: Booking): Promise<Booking>;
  findById(bookingId: string): Promise<Booking | null>;
  findByBookingId(bookingId: string): Promise<Booking | null>;
  findBookingsOfUser(params: {
    userId: string;
    page?: number;
    limit?: number;
    status?: string[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ bookings: Booking[]; totalCount: number }>;
  findAllBookings(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ bookings: Booking[]; totalCount: number }>;
  updatePaymentStatusAndId(bookingId: string, paymentId: string): Promise<void>;
  findBookingsOfVendor(params: {
    vendorId: string;
    page?: number;
    limit?: number;
    status?: string[];
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ bookings: Booking[]; totalCount: number }>;
  cancelBooking(bookingId: string, reason: string): Promise<Booking | null>;
  countBookings(userId: string): Promise<number>;
}
