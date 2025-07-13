import { MoviePassHistory } from '../../../entities/moviePass.entity';

export interface IFindMoviePassHistoryUseCase {
  execute(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{
    history: MoviePassHistory[];
    total: number;
  }>;
}
