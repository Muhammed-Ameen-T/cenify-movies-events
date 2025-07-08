import { inject, injectable } from 'tsyringe';
import { Booking } from '../../../domain/entities/booking.entity';
import { IBookingRepository } from '../../../domain/interfaces/repositories/booking.repository';
import { IFindBookingsOfVendorUseCase } from '../../../domain/interfaces/useCases/User/findBookingsOfVendor.interface';
import { CustomError } from '../../../utils/errors/custom.error';
import { HttpResCode } from '../../../utils/constants/httpResponseCode.utils';
import ERROR_MESSAGES from '../../../utils/constants/commonErrorMsg.constants';

@injectable()
export class FindBookingsOfVendorUseCase implements IFindBookingsOfVendorUseCase {
  constructor(@inject('BookingRepository') private bookingRepository: IBookingRepository) {}

  async execute(params: {
    vendorId: string;
    page?: number;
    limit?: number;
    status?: string[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ bookings: Booking[]; totalCount: number; totalPages: number }> {
    try {
      const page = params.page || 1;
      const limit = params.limit || 8;

      const { bookings, totalCount } = await this.bookingRepository.findBookingsOfVendor(params);
      const totalPages = Math.ceil(totalCount / limit);

      return {
        bookings,
        totalCount,
        totalPages,
      };
    } catch (error) {
      throw new CustomError(ERROR_MESSAGES.DATABASE.RECORD_NOT_FOUND, HttpResCode.NOT_FOUND);
    }
  }
}
