import { TheaterResponseDTO } from '../../../../application/dtos/vendor.dto';
import { FetchTheatersParams } from '../../../types/theater';

export interface IFetchAdminTheatersUseCase {
  execute(params: FetchTheatersParams): Promise<{
    theaters: TheaterResponseDTO[];
    totalCount: number;
  }>;
}
