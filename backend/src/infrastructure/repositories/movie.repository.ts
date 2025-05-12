import { inject, injectable } from 'tsyringe';
import { Movie } from '../../domain/entities/movie.entity';
import { IMovieRepository } from '../../domain/interfaces/repositories/movie.repository';
import MovieModel from '../database/movie.model';

@injectable()
export class MovieRepository implements IMovieRepository {
  constructor() {}

  async create(movie: Movie): Promise<Movie> {
    try {
      const newMovie = new MovieModel(movie);
      console.log("🚀 ~ MovieRepository ~ create ~ newMovie:", newMovie);
      const savedMovie = await newMovie.save();
      return this.mapToEntity(savedMovie);
    } catch (error) {
      console.error('❌ Error creating movie:', error);
      if (error instanceof Error) {
        throw new Error(`Error creating movie: ${error.message}`);
      }
      throw new Error('Error creating movie: An unknown error occurred');
    }
  }

  async findAll(params?: {
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
  }> {
    try {
      const page = params?.page || 1;
      const limit = params?.limit || 8;
      const skip = (page - 1) * limit;

      // Build query
      const query: any = {};
      
      if (params?.search) {
        query.name = { $regex: params.search, $options: 'i' }; // Case-insensitive search
      }
      
      if (params?.status && params.status.length > 0) {
        query.status = { $in: params.status };
      }
      
      if (params?.genre && params.genre.length > 0) {
        query.genre = { $in: params.genre };
      }

      // Build sort
      const sort: any = {};
      if (params?.sortBy && params?.sortOrder) {
        sort[params.sortBy] = params.sortOrder === 'asc' ? 1 : -1;
      }

      // Fetch movies with pagination and filters
      const movieDocs = await MovieModel.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();

      // Count total documents matching the query
      const totalCount = await MovieModel.countDocuments(query);

      return {
        movies: movieDocs.map((doc) => this.mapToEntity(doc)),
        totalCount,
      };
    } catch (error) {
      console.error('❌ Error fetching movies:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to retrieve movies: ${error.message}`);
      }
      throw new Error('Failed to retrieve movies: An unknown error occurred');
    }
  }

  async findById(id: string): Promise<Movie | null> {
    try {
      const movieDoc = await MovieModel.findById(id).lean();
      return movieDoc ? this.mapToEntity(movieDoc) : null;
    } catch (error) {
      console.error('❌ Error fetching movie by ID:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to retrieve movie: ${error.message}`);
      }
      throw new Error('Failed to retrieve movie: An unknown error occurred');
    }
  }

  async updateStatus(id: string, status: string): Promise<Movie> {
    try {
      const movieDoc = await MovieModel.findByIdAndUpdate(
        id,
        { status, updatedAt: new Date() },
        { new: true }
      ).lean();
      if (!movieDoc) throw new Error('Movie not found');
      return this.mapToEntity(movieDoc);
    } catch (error) {
      console.error('❌ Error updating movie status:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to update movie status: ${error.message}`);
      }
      throw new Error('Failed to update movie status: An unknown error occurred');
    }
  }

  async update(movie: Movie): Promise<Movie> {
    try {
      const updatedMovie = await MovieModel.findByIdAndUpdate(
        movie._id,
        { ...movie, updatedAt: new Date() },
        { new: true }
      ).lean();
      if (!updatedMovie) throw new Error('Movie not found');
      return this.mapToEntity(updatedMovie);
    } catch (error) {
      console.error('❌ Error updating movie:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to update movie: ${error.message}`);
      }
      throw new Error('Failed to update movie: An unknown error occurred');
    }
  }

  private mapToEntity(doc: any): Movie {
    return new Movie(
      doc._id,
      doc.name,
      doc.genre,
      doc.trailer,
      doc.rating,
      doc.poster,
      doc.duration,
      doc.description,
      doc.language,
      doc.releaseDate,
      doc.status,
      doc.likes,
      doc.interests,
      doc.is3D,
      doc.crew,
      doc.cast,
      doc.reviews,
      doc.createdAt,
      doc.updatedAt
    );
  }
}