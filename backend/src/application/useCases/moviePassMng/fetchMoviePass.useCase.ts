import { inject, injectable } from 'tsyringe';
import { MoviePass } from '../../../domain/entities/moviePass.entity';
import { IMoviePassRepository } from '../../../domain/interfaces/repositories/moviePass.repository';
import { IFetchMoviePassUseCase } from '../../../domain/interfaces/useCases/User/moviePass.interface';

@injectable()
export class FetchMoviePassUseCase implements IFetchMoviePassUseCase {
  constructor(@inject('MoviePassRepository') private _moviePassRepository: IMoviePassRepository) {}

  async execute(userId: string): Promise<MoviePass | null> {
    const moviePass = await this._moviePassRepository.findByUserId(userId);
    if (!moviePass) {
      return null;
    }
    return moviePass;
  }
}
