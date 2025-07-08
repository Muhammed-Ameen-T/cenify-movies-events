import { Movie } from '../../../entities/movie.entity';
import { UpdateMovieDTO } from '../../../../application/dtos/movie.dto';

export interface IUpdateMovieUseCase {
  execute(dto: UpdateMovieDTO): Promise<Movie>;
}
