import { Show } from '../../../entities/show.entity';
import { UpdateShowDTO } from '../../../../application/dtos/show.dto';

export interface IUpdateShowUseCase {
  execute(dto: UpdateShowDTO): Promise<Show>;
}
