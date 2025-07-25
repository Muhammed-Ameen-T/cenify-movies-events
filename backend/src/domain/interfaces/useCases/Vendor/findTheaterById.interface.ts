import { Theater } from '../../../entities/theater.entity';
export interface IFindTheaterByIdUseCase {
  execute(theaterId: string): Promise<Theater | null>;
}
