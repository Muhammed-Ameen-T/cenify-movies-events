import { Movie } from '../../../entities/movie.entity';

export interface IFindMovieByIdUseCase {
  execute(id: string): Promise<Movie>;
}
