import { inject, injectable } from 'tsyringe';
import { MoviePass } from '../../../domain/entities/moviePass.entity';
import { IMoviePassRepository } from '../../../domain/interfaces/repositories/moviePass.repository';
import { CustomError } from '../../../utils/errors/custom.error';
import { HttpResCode } from '../../../utils/constants/httpResponseCode.utils';
import { IFetchMoviePassUseCase } from '../../../domain/interfaces/useCases/User/moviePass.interface';

@injectable()
export class FetchMoviePassUseCase implements IFetchMoviePassUseCase {
  constructor(@inject('MoviePassRepository') private moviePassRepository: IMoviePassRepository) {}

  async execute(userId: string): Promise<MoviePass | null> {
    const moviePass = await this.moviePassRepository.findByUserId(userId);
    if (!moviePass) {
      return null;
    }
    return moviePass;
  }
}
