// src/domain/interfaces/useCases/Movie/likeOrUnlikeMovie.interface.ts

export interface ILikeOrUnlikeMovieUseCase {
  execute(movieId: string, userId: string, isLike: boolean): Promise<any>;
}
