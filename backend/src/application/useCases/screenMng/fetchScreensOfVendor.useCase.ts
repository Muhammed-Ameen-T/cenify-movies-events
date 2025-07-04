import { inject, injectable } from 'tsyringe';
import { IScreenRepository } from '../../../domain/interfaces/repositories/screen.repository';
import { IFetchScreensOfVendorUseCase } from '../../../domain/interfaces/useCases/Vendor/fetchScreenOfVendor.interface';
import { CustomError } from '../../../utils/errors/custom.error';
import { HttpResCode } from '../../../utils/constants/httpResponseCode.utils';
import ERROR_MESSAGES from '../../../utils/constants/commonErrorMsg.constants';

@injectable()
export class FetchScreensOfVendorUseCase implements IFetchScreensOfVendorUseCase {
  constructor(@inject('ScreenRepository') private screenRepository: IScreenRepository) {}

  async execute(params: {
    vendorId: string;
    page?: number;
    limit?: number;
    search?: string;
    theaterId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ screens: any[]; totalCount: number }> {
    try {
      const result = await this.screenRepository.findScreensByVendor(params);
      return result;
    } catch (error) {
      throw new CustomError(
        ERROR_MESSAGES.GENERAL.FAILED_FETCHING_RECORDS,
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
