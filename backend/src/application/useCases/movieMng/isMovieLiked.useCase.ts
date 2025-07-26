// src/application/usecases/movie/isMovieLiked.usecase.ts
import { inject, injectable } from 'tsyringe';
import { IIsMovieLikedUseCase } from '../../../domain/interfaces/useCases/User/isMovieLiked.interface';
import { IMovieRepository } from '../../../domain/interfaces/repositories/movie.repository';
import { CustomError } from '../../../utils/errors/custom.error';
import { HttpResCode } from '../../../utils/constants/httpResponseCode.utils';
import ERROR_MESSAGES from '../../../utils/constants/commonErrorMsg.constants';

@injectable()
export class IsMovieLikedUseCase implements IIsMovieLikedUseCase {
  constructor(@inject('MovieRepository') private movieRepository: IMovieRepository) {}

  async execute(movieId: string, userId: string): Promise<{ isLiked: boolean }> {
    if (!movieId || !userId) {
      throw new CustomError(
        ERROR_MESSAGES.VALIDATION.MISSING_REQUIRED_FIELDS,
        HttpResCode.BAD_REQUEST,
      );
    }

    const isLiked = await this.movieRepository.hasUserLikedMovie(movieId, userId);
    return { isLiked };
  }
}
