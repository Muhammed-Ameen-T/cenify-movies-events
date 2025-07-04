import { inject, injectable } from 'tsyringe';
import { Movie } from '../../../domain/entities/movie.entity';
import { IMovieRepository } from '../../../domain/interfaces/repositories/movie.repository';
import { UpdateMovieDTO } from '../../dtos/movie.dto';
import { IUpdateMovieUseCase } from '../../../domain/interfaces/useCases/Admin/updateMovie.interface';
import { CustomError } from '../../../utils/errors/custom.error';
import { HttpResCode } from '../../../utils/constants/httpResponseCode.utils';
import ERROR_MESSAGES from '../../../utils/constants/commonErrorMsg.constants';

@injectable()
export class UpdateMovieUseCase implements IUpdateMovieUseCase {
  constructor(@inject('MovieRepository') private movieRepository: IMovieRepository) {}

  async execute(dto: UpdateMovieDTO): Promise<Movie> {
    const existingMovie = await this.movieRepository.findById(dto.id);
    if (!existingMovie) {
      throw new CustomError(ERROR_MESSAGES.DATABASE.RECORD_NOT_FOUND, HttpResCode.NOT_FOUND);
    }

    const updatedMovie = new Movie(
      dto.id,
      dto.name,
      dto.genre,
      dto.trailer,
      dto.rating,
      dto.poster,
      dto.duration,
      dto.description,
      dto.language,
      new Date(dto.releaseDate),
      existingMovie.status,
      existingMovie.likes,
      existingMovie.likedBy,
      dto.is3D,
      dto.crew,
      dto.cast,
      existingMovie.reviews,
    );

    try {
      const savedMovie = await this.movieRepository.update(updatedMovie);
      return savedMovie;
    } catch (error) {
      throw new CustomError(
        ERROR_MESSAGES.DATABASE.RECORD_NOT_SAVED,
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
