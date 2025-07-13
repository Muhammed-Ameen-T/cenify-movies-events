import { TheaterResponseDTO } from '../../../../application/dtos/vendor.dto';

export interface IFetchTheatersUseCase {
  execute(): Promise<TheaterResponseDTO[]>;
}
