import { inject, injectable } from 'tsyringe';
import { Movie } from '../../../domain/entities/movie.entity';
import { IMovieRepository } from '../../../domain/interfaces/repositories/movie.repository';
import { UpdateMovieStatusDTO } from '../../dtos/movie.dto';
import { IUpdateMovieStatusUseCase } from '../../../domain/interfaces/useCases/Admin/updateMovieStatus.interface';
import { CustomError } from '../../../utils/errors/custom.error';
import { HttpResCode } from '../../../utils/constants/httpResponseCode.utils';
import ERROR_MESSAGES from '../../../utils/constants/commonErrorMsg.constants';

@injectable()
export class UpdateMovieStatusUseCase implements IUpdateMovieStatusUseCase {
  constructor(@inject('MovieRepository') private movieRepository: IMovieRepository) {}

  async execute(dto: UpdateMovieStatusDTO): Promise<Movie> {
    const validStatuses = ['upcoming', 'released', 'archived'];
    if (!validStatuses.includes(dto.status)) {
      throw new CustomError(ERROR_MESSAGES.VALIDATION.INVALID_STATUS, HttpResCode.BAD_REQUEST);
    }

    try {
      const updatedMovie = await this.movieRepository.updateStatus(dto.id, dto.status);
      return updatedMovie;
    } catch (error) {
      throw new CustomError(ERROR_MESSAGES.DATABASE.RECORD_NOT_FOUND, HttpResCode.NOT_FOUND);
    }
  }
}
