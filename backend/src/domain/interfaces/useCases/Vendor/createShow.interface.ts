import { Show } from '../../../entities/show.entity';
import { CreateShowDTO } from '../../../../application/dtos/show.dto';

export interface ICreateShowUseCase {
  execute(vendorId: string | undefined, dto: CreateShowDTO): Promise<Show[]>;
}
