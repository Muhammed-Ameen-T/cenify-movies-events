import { injectable, inject } from 'tsyringe';
import { ITheaterRepository } from '../../../domain/interfaces/repositories/theater.repository';
import { IFetchTheaterOfVendorUseCase } from '../../../domain/interfaces/useCases/Vendor/fetchTheatersOfVendor.interface';
import { Theater } from '../../../domain/entities/theater.entity';
import { CustomError } from '../../../utils/errors/custom.error';
import { HttpResCode } from '../../../utils/constants/httpResponseCode.utils';
import ERROR_MESSAGES from '../../../utils/constants/commonErrorMsg.constants';

@injectable()
export class FetchTheaterOfVendorUseCase implements IFetchTheaterOfVendorUseCase {
  constructor(@inject('TheaterRepository') private theaterRepository: ITheaterRepository) {}
  /**
   * Fetches theaters for a specific vendor.
   * @param params - The parameters for fetching theaters.
   * @param params.vendorId - The ID of the vendor.
   * @param params.page - The page number for pagination (default: 1).
   * @param params.limit - The number of theaters per page (default: 8).
   * @param params.search - The search term to filter theaters by name.
   * @param params.status - The status of the theaters to filter by.
   * @param params.location - The location of the theaters to filter by.
   * @param params.sortBy - The field to sort the theaters by.
   * @param params.sortOrder - The order to sort the theaters ('asc' or 'desc').
   * @returns An object containing the list of theaters, total count, and total pages.
   */
  async execute(
    params: {
      vendorId: string;
      page?: number;
      limit?: number;
      search?: string;
      status?: string[];
      location?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    } = { vendorId: '' },
  ): Promise<{
    theaters: Theater[];
    totalCount: number;
    totalPages: number;
  }> {
    try {
      const page = params?.page || 1;
      const limit = params?.limit || 8;

      const { theaters, totalCount } = await this.theaterRepository.findTheatersByVendor(params);
      const totalPages = Math.ceil(totalCount / limit);

      return {
        theaters,
        totalCount,
        totalPages,
      };
    } catch (error) {
      throw new CustomError(ERROR_MESSAGES.DATABASE.RECORD_NOT_FOUND, HttpResCode.NOT_FOUND);
    }
  }
}
