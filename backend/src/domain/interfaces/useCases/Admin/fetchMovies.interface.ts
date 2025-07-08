import { Movie } from '../../../entities/movie.entity';

export interface IFetchMoviesUseCase {
  execute(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string[];
    genre?: string[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    movies: Movie[];
    totalCount: number;
    totalPages: number;
  }>;
}
