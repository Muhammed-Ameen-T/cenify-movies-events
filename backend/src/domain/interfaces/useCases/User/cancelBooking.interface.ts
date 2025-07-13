import { Booking } from '../../../entities/booking.entity';

export interface ICancelBookingUseCase {
  execute(bookingId: string, reason: string): Promise<Booking>;
}
