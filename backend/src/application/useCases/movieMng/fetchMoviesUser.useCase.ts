// src/application/useCases/user/fetchMoviesUser.useCase.ts
import { inject, injectable } from 'tsyringe';
import { Movie } from '../../../domain/entities/movie.entity';
import { IMovieRepository } from '../../../domain/interfaces/repositories/movie.repository';
import { IFetchMoviesUserUseCase } from '../../../domain/interfaces/useCases/User/fetchMovieUser.interface';
import { CustomError } from '../../../utils/errors/custom.error';
import { HttpResCode } from '../../../utils/constants/httpResponseCode.utils';
import ERROR_MESSAGES from '../../../utils/constants/commonErrorMsg.constants';

@injectable()
export class FetchMoviesUserUseCase implements IFetchMoviesUserUseCase {
  constructor(@inject('MovieRepository') private movieRepository: IMovieRepository) {}

  async execute(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string[];
    genre?: string[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    latitude: number;
    longitude: number;
    selectedLocation: string;
  }): Promise<{
    movies: Movie[];
    totalCount: number;
    totalPages: number;
  }> {
    try {
      const page = params.page || 1;
      const limit = params.limit || 8;

      const { movies, totalCount } = await this.movieRepository.findAllByUserLocation(params);
      const totalPages = Math.ceil(totalCount / limit);

      return {
        movies,
        totalCount,
        totalPages,
      };
    } catch (error) {
      throw new CustomError(ERROR_MESSAGES.DATABASE.RECORD_NOT_FOUND, HttpResCode.NOT_FOUND);
    }
  }
}
