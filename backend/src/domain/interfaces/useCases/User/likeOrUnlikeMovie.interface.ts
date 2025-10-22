// src/domain/interfaces/useCases/Movie/likeOrUnlikeMovie.interface.ts

import { Movie } from "../../../entities/movie.entity";

export interface ILikeOrUnlikeMovieUseCase {
  execute(movieId: string, userId: string, isLike: boolean): Promise<Movie>;
}
