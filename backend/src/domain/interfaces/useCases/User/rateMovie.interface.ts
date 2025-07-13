// src/domain/interfaces/useCases/User/movie.interface.ts
import { SubmitRatingDTO } from '../../../../application/dtos/movie.dto';
import { Movie } from '../../../../domain/entities/movie.entity';

export interface IRateMovieUseCase {
  execute(dto: SubmitRatingDTO): Promise<Movie>;
}
