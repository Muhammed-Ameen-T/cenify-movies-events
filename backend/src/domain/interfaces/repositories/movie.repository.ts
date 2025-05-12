import { Movie } from '../../entities/movie.entity';

export interface IMovieRepository {
  create(movie: Movie): Promise<Movie>;
  findAll(params?: {
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
  }>; 
  findById(id: string): Promise<Movie | null>;
  updateStatus(id: string, status: string): Promise<Movie>;
  update(movie: Movie): Promise<Movie>;
}