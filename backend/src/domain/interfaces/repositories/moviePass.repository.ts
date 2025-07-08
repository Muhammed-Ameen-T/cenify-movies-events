import { MoviePass, MoviePassHistory } from '../../../domain/entities/moviePass.entity';

export interface IMoviePassRepository {
  create(moviePass: MoviePass): Promise<MoviePass>;
  findByUserId(userId: string): Promise<MoviePass | null>;
  updateStatus(userId: string, status: 'Active' | 'Inactive'): Promise<MoviePass | null>;
  update(userId: string, updates: Partial<MoviePass>): Promise<MoviePass | null>;
  incrementMovieStats(userId: string, newSaving: number): Promise<MoviePass | null>;
  findHistoryByUserId(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{
    history: MoviePassHistory[];
    total: number;
  }>;
}
