import { Screen } from '../../../../domain/entities/screen.entity';
import { CreateScreenDTO } from '../../../../application/dtos/screen.dto';

export interface ICreateScreenUseCase {
  execute(dto: CreateScreenDTO): Promise<Screen>;
}
