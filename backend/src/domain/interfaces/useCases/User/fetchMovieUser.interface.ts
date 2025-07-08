// src/domain/interfaces/useCases/user/fetchMoviesUser.interface.ts
import { Movie } from '../../../entities/movie.entity';

export interface IFetchMoviesUserUseCase {
  execute(params: {
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
  }>;
}
