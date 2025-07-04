import { Movie } from '../../../entities/movie.entity';
import { UpdateMovieStatusDTO } from '../../../../application/dtos/movie.dto';

export interface IUpdateMovieStatusUseCase {
  execute(dto: UpdateMovieStatusDTO): Promise<Movie>;
}
