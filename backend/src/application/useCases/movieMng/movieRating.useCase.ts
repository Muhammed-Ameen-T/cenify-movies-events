import { inject, injectable } from 'tsyringe';
import { IRateMovieUseCase } from '../../../domain/interfaces/useCases/User/rateMovie.interface';
import { IMovieRepository } from '../../../domain/interfaces/repositories/movie.repository';
import { CustomError } from '../../../utils/errors/custom.error';
import { HttpResCode } from '../../../utils/constants/httpResponseCode.utils';
import ERROR_MESSAGES from '../../../utils/constants/commonErrorMsg.constants';
import { Movie } from '../../../domain/entities/movie.entity';
import { SubmitRatingDTO } from '../../dtos/movie.dto';
import { ITheaterRepository } from '../../../domain/interfaces/repositories/theater.repository';

@injectable()
export class RateMovieUseCase implements IRateMovieUseCase {
  constructor(
    @inject('MovieRepository') private movieRepository: IMovieRepository,
    @inject('TheaterRepository') private theaterRepository: ITheaterRepository,
  ) {}

  async execute(dto: SubmitRatingDTO): Promise<Movie> {
    if (dto.movieRating < 1 || dto.movieRating > 5) {
      throw new CustomError(ERROR_MESSAGES.VALIDATION.RATING_MUST_BETWEEN, HttpResCode.BAD_REQUEST);
    }
    try {
      const existingReview = await this.movieRepository.findReviewByUserId(dto.movieId, dto.userId);
      if (existingReview) {
        throw new CustomError(
          ERROR_MESSAGES.VALIDATION.REVIEW_ALREADY_EXISTS,
          HttpResCode.BAD_REQUEST,
        );
      }
      const updatedMovie = await this.movieRepository.addReviewAndUpdateRating(dto.movieId, {
        comment: dto.movieReview,
        rating: dto.movieRating.toString(),
        userId: dto.userId,
      });

      await this.theaterRepository.addRating(dto.theaterId, dto.theaterRating);

      if (!updatedMovie) {
        throw new CustomError(ERROR_MESSAGES.DATABASE.RECORD_NOT_FOUND, HttpResCode.NOT_FOUND);
      }

      return updatedMovie;
    } catch (error) {
      throw new CustomError(
        ERROR_MESSAGES.GENERAL.FAILED_UPDATING_RECORD,
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
