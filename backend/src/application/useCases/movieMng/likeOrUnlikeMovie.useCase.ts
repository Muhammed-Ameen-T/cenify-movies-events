// src/application/usecases/movie/likeOrUnlikeMovie.usecase.ts
import { inject, injectable } from 'tsyringe';
import { ILikeOrUnlikeMovieUseCase } from '../../../domain/interfaces/useCases/User/likeOrUnlikeMovie.interface';
import { IMovieRepository } from '../../../domain/interfaces/repositories/movie.repository';
import { CustomError } from '../../../utils/errors/custom.error';
import { HttpResCode } from '../../../utils/constants/httpResponseCode.utils';
import ERROR_MESSAGES from '../../../utils/constants/commonErrorMsg.constants';

@injectable()
export class LikeOrUnlikeMovieUseCase implements ILikeOrUnlikeMovieUseCase {
  constructor(@inject('MovieRepository') private movieRepository: IMovieRepository) {}

  async execute(movieId: string, userId: string, isLike: boolean): Promise<any> {
    if (!movieId || !userId || typeof isLike !== 'boolean') {
      throw new CustomError(
        ERROR_MESSAGES.VALIDATION.MISSING_REQUIRED_FIELDS,
        HttpResCode.BAD_REQUEST,
      );
    }

    const updatedMovie = await this.movieRepository.likeMovie(movieId, userId, isLike);

    if (!updatedMovie) {
      throw new CustomError(ERROR_MESSAGES.GENERAL.MOVIE_NOT_UPDATED, HttpResCode.NOT_FOUND);
    }

    return updatedMovie;
  }
}
