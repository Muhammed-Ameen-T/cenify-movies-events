import { Booking } from '../../../entities/booking.entity';

export interface IFindBookingByIdUseCase {
  execute(id: string): Promise<Booking>;
}
