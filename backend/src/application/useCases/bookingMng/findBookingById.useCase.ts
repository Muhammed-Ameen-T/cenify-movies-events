import { inject, injectable } from 'tsyringe';
import { Booking } from '../../../domain/entities/booking.entity';
import { IBookingRepository } from '../../../domain/interfaces/repositories/booking.repository';
import { IFindBookingByIdUseCase } from '../../../domain/interfaces/useCases/User/findBookingById.interface';
import { CustomError } from '../../../utils/errors/custom.error';
import { HttpResCode } from '../../../utils/constants/httpResponseCode.utils';
import ERROR_MESSAGES from '../../../utils/constants/commonErrorMsg.constants';

@injectable()
export class FindBookingByIdUseCase implements IFindBookingByIdUseCase {
  constructor(@inject('BookingRepository') private bookingRepository: IBookingRepository) {}

  async execute(id: string): Promise<Booking> {
    try {
      const booking = await this.bookingRepository.findByBookingId(id);
      if (!booking) {
        throw new CustomError(ERROR_MESSAGES.DATABASE.RECORD_NOT_FOUND, HttpResCode.NOT_FOUND);
      }
      return booking;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError(ERROR_MESSAGES.DATABASE.RECORD_NOT_FOUND, HttpResCode.NOT_FOUND);
    }
  }
}
