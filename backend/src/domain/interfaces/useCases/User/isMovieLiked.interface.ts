// src/domain/interfaces/useCases/Movie/isMovieLiked.interface.ts
export interface IIsMovieLikedUseCase {
  execute(movieId: string, userId: string): Promise<{ isLiked: boolean }>;
}
