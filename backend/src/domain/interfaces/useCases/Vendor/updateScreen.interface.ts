import { Screen } from '../../../../domain/entities/screen.entity';
import { UpdateScreenDTO } from '../../../../application/dtos/screen.dto';

export interface IUpdateScreenUseCase {
  execute(id: string, dto: UpdateScreenDTO): Promise<Screen>;
}
