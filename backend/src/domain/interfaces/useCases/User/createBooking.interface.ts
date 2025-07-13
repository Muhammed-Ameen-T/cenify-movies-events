import { CreateBookingDTO } from '../../../../application/dtos/booking.dto';
import { Booking } from '../../../entities/booking.entity';

export interface ICreateBookingUseCase {
  execute(dto: CreateBookingDTO): Promise<{ booking: Booking; stripeSessionUrl?: string }>;
}
