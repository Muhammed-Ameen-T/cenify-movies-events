import { TheaterDetailsDTO, UpdateTheaterDetailsDTO } from '../../../../application/dtos/vendor.dto';
import { Vendor } from '../../../entities/theater.entity';

// Interface for the use case
export interface IUpdateVendorDetailsUseCase {
  execute(dto: UpdateTheaterDetailsDTO): Promise<Vendor>;
}
