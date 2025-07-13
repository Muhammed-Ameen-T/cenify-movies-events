import { inject, injectable } from 'tsyringe';
import { ISeatLayoutRepository } from '../../../domain/interfaces/repositories/seatLayout.repository';
import { IFindSeatLayoutsByVendorUseCase } from '../../../domain/interfaces/useCases/Vendor/fetchLayoutsVendor.interface';
import { CustomError } from '../../../utils/errors/custom.error';
import { HttpResCode } from '../../../utils/constants/httpResponseCode.utils';
import ERROR_MESSAGES from '../../../utils/constants/commonErrorMsg.constants';

@injectable()
export class FindSeatLayoutsByVendorUseCase implements IFindSeatLayoutsByVendorUseCase {
  constructor(
    @inject('SeatLayoutRepository') private seatLayoutRepository: ISeatLayoutRepository,
  ) {}

  async execute(params: {
    vendorId: string;
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ seatLayouts: any[]; totalCount: number }> {
    try {
      const result = await this.seatLayoutRepository.findByVendor(params);
      return result;
    } catch (error) {
      throw new CustomError(
        ERROR_MESSAGES.GENERAL.FAILED_FETCHING_RECORDS,
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
