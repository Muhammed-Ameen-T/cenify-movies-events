import { Show } from '../../../entities/show.entity';

export interface IFindShowByIdUseCase {
  execute(showId: string): Promise<Show | null>;
}
