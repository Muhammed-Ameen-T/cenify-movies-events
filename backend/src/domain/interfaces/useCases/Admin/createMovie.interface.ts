import { Movie } from '../../../entities/movie.entity';
import { CreateMovieDTO } from '../../../../application/dtos/movie.dto';

export interface ICreateMovieUseCase {
  execute(dto: CreateMovieDTO): Promise<Movie>;
}
