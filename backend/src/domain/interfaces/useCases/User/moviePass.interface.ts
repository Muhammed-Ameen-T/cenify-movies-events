import { MoviePass } from '../../../../domain/entities/moviePass.entity';
import { CreateMoviePassDTO } from '../../../../application/dtos/moviePass.dto';

export interface ICreateMoviePassUseCase {
  execute(dto: CreateMoviePassDTO): Promise<MoviePass>;
}

export interface IUpdateMoviePassStatusUseCase {
  execute(userId: string, status: 'Active' | 'Inactive'): Promise<MoviePass>;
}

export interface IFetchMoviePassUseCase {
  execute(userId: string): Promise<MoviePass | null>;
}
