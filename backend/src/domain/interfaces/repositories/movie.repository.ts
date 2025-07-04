import { Types } from 'mongoose';
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
  findAllByUserLocation(params: {
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
  }>;
  addReviewAndUpdateRating(
    movieId: string,
    review: {
      comment: string;
      rating: string;
      userId: string;
    },
  ): Promise<Movie>;
  findReviewByUserId(
    movieId: string,
    userId: string,
  ): Promise<{
    comment: string;
    createdAt: Date;
    rating: string;
    likes: number;
    userId: Types.ObjectId;
  } | null>;
  findReviewByUserId(
    movieId: string,
    userId: string,
  ): Promise<{
    comment: string;
    createdAt: Date;
    rating: string;
    likes: number;
    userId: Types.ObjectId;
  } | null>;
  hasUserLikedMovie(movieId: string, userId: string): Promise<boolean>;
  likeMovie(movieId: string, userId: string, isLike: boolean): Promise<Movie | null>;
}
