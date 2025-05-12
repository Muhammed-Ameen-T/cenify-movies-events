import api from '../../config/axios.config';
import { ADMIN_ENDPOINTS } from '../../constants/apiEndPoint';
import { IMovie } from '../../types/movie';

interface FetchMoviesParams {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  genre?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface FetchMoviesResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    movies: IMovie[];
    totalCount: number;
    totalPages: number;
  };
}

export const movieService = {
  // Get all movies with pagination and filters
  getMovies: async (params: FetchMoviesParams): Promise<FetchMoviesResponse['data']> => {
    const response = await api.get<FetchMoviesResponse>(ADMIN_ENDPOINTS.fetchMovies, {
      params,
    });
    console.log("🚀 ~ getMovies: ~ response:", response)
    
    return response.data.data;
  },

  // Update movie status
  updateMovieStatus: async (id: string, status: string): Promise<IMovie> => {
    const response = await api.patch<{
      success: boolean;
      status: number;
      message: string;
      data: IMovie;
    }>(ADMIN_ENDPOINTS.updateMovieStatus, { id, status });
    return response.data.data;
  },

  // Create a new movie
  createMovie: async (movieData: any): Promise<IMovie> => {
    try {
      const response = await api.post<{
        success: boolean;
        status: number;
        message: string;
        data: IMovie;
      }>(ADMIN_ENDPOINTS.createMovie, movieData);
      return response.data.data;
    } catch (error) {
      console.error('❌ Error creating movie:', error);
      throw new Error('Error creating movie: An unknown error occurred');
    }
  },
  
  findById: async (id: string): Promise<IMovie> => {
    const response = await api.get<{
      success: boolean;
      status: number;
      message: string;
      data: IMovie;
    }>(`${ADMIN_ENDPOINTS.fetchMovieById}/${id}`);
    return response.data.data;
  },
  // Update a movie
  updateMovie: async (id: string, movieData: Partial<IMovie>): Promise<IMovie> => {
    const response = await api.put<{
      success: boolean;
      status: number;
      message: string;
      data: IMovie;
    }>(ADMIN_ENDPOINTS.updateMovie, { id, ...movieData });
    return response.data.data;
  },
};