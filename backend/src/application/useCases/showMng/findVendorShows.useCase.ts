import { inject, injectable } from 'tsyringe';
import { Show } from '../../../domain/entities/show.entity';
import { IShowRepository } from '../../../domain/interfaces/repositories/show.repository';
import { IFindShowsByVendorUseCase } from '../../../domain/interfaces/useCases/Vendor/fetchVendorShows.interface';
import { CustomError } from '../../../utils/errors/custom.error';
import { HttpResCode } from '../../../utils/constants/httpResponseCode.utils';
import ERROR_MESSAGES from '../../../utils/constants/commonErrorMsg.constants';

@injectable()
export class FindShowsByVendorUseCase implements IFindShowsByVendorUseCase {
  constructor(@inject('ShowRepository') private showRepository: IShowRepository) {}

  async execute(params: {
    vendorId: string;
    page?: number;
    limit?: number;
    search?: string;
    theaterId?: string;
    movieId?: string;
    screenId?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ shows: Show[]; totalCount: number }> {
    try {
      return await this.showRepository.findShowsByVendor(params);
    } catch (error) {
      console.error('❌ Error fetching shows by vendor:', error);
      throw new CustomError('Failed to retrieve shows', HttpResCode.INTERNAL_SERVER_ERROR);
    }
  }
}
