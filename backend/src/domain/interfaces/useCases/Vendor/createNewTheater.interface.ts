import {
  TheaterDetailsDTO,
  UpdateTheaterDetailsDTO,
} from '../../../../application/dtos/vendor.dto';
import { Theater } from '../../../entities/theater.entity';

// Interface for the use case
export interface ICreateNewTheaterUseCase {
  execute(dto: TheaterDetailsDTO): Promise<Theater>;
}
