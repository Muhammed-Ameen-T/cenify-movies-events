import { inject, injectable } from 'tsyringe';
import { Movie } from '../../../domain/entities/movie.entity';
import { IMovieRepository } from '../../../domain/interfaces/repositories/movie.repository';
import { CreateMovieDTO } from '../../dtos/movie.dto';
import { ICreateMovieUseCase } from '../../../domain/interfaces/useCases/Admin/createMovie.interface';
import { CustomError } from '../../../utils/errors/custom.error';
import { HttpResCode } from '../../../utils/constants/httpResponseCode.utils';
import ERROR_MESSAGES from '../../../utils/constants/commonErrorMsg.constants';

@injectable()
export class CreateMovieUseCase implements ICreateMovieUseCase {
  constructor(@inject('MovieRepository') private movieRepository: IMovieRepository) {}

  async execute(dto: CreateMovieDTO): Promise<Movie> {
    const newMovie = new Movie(
      null as any,
      dto.name,
      dto.genre,
      dto.trailer,
      dto.rating,
      dto.poster,
      dto.duration,
      dto.description,
      dto.language,
      new Date(dto.releaseDate),
      'upcoming',
      0,
      [],
      dto.is3D,
      dto.crew,
      dto.cast,
      [],
    );

    try {
      const savedMovie = await this.movieRepository.create(newMovie);
      return savedMovie;
    } catch (error) {
      throw new CustomError(
        ERROR_MESSAGES.DATABASE.RECORD_NOT_SAVED,
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
