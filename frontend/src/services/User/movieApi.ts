import { USER_AUTH_ENDPOINTS } from "../../constants/apiEndPoint";
import api from "../../config/axios.config";
import { handleAxiosError } from "../../utils/exios-error-handler";
import { ERROR_MESSAGES } from "../../constants/auth.messages";
import { IMovie } from "../../types/movie";


export interface MovieResponse {
    movies: any[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
}

export interface BookmarkResponse {
  success: boolean;
  movieId: string;
  isBookmarked: boolean;
}

export interface MovieFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string[];
  genre?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
/**
 * Fetch movies with advanced filtering options
 * @param filters - Filter parameters for movie search
 * @returns Promise<MovieResponse | null>
*/
export const getMoviesWithFilters = async (filters: MovieFilters = { page: 1, limit: 12 }): Promise<MovieResponse | null> => {
  try {
    // Convert arrays to comma-separated strings for API
    const params = {
      ...filters,
      status: filters.status?.length ? filters.status.join(',') : undefined,
      genre: filters.genre?.length ? filters.genre.join(',') : undefined,
    };
    
    // Remove undefined values
    const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {} as any);
    
    const response = await api.get(USER_AUTH_ENDPOINTS.userMovies, { params: cleanParams });
    
    console.log("🚀 ~ getMoviesWithFilters ~ response:", response)
    return {
      movies: response.data.data.movies || [],
      totalCount: response.data.data.totalCount || 0,
      totalPages: response.data.data.totalPages || 0,
      currentPage: response.data.data.currentPage || 1,
    };
  } catch (error) {
    handleAxiosError(error, ERROR_MESSAGES.FETCH_USER_MOVIES_FAILED);
    return null;
  }
};

/**
 * Get movie details by ID
 * @param movieId - ID of the movie
 * @returns Promise<any | null>
 */
export const getMovieDetails = async (movieId: string): Promise<any | null> => {
  try {
    const response = await api.get(`${USER_AUTH_ENDPOINTS.movieDetails}/${movieId}`);
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, 'Failed to fetch movie details');
    return null;
  }
};

/**
 * Get basic movies for home page (backward compatibility)
 * @param params - Basic pagination parameters
 * @returns Promise<any>
*/
export const getUserMovies = async (params = { page: 1, limit: 8 }): Promise<any> => {
  try {
    const response = await api.get(USER_AUTH_ENDPOINTS.userMovies, { params });
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, ERROR_MESSAGES.FETCH_USER_MOVIES_FAILED);
    return null;
  }
};

/**
 * Get basic movies for home page (backward compatibility)
 * @param params - Basic pagination parameters
 * @returns Promise<any>
*/
/**
 * Fetch movies for "You Might Also Like" section based on genres
 * @param params - Parameters including genres, page, and limit
 * @returns Promise<MovieResponse | null>
 */
export const getUserMoviesForYouMightAlsoLike = async (params: {
  page?: number;
  limit?: number;
  genres?: string[];
} = { page: 1, limit: 8 }): Promise<MovieResponse | null> => {
  try {
    const cleanParams = {
      page: params.page,
      limit: params.limit,
      genre: params.genres?.length ? params.genres.join(',') : undefined,
    };

    // Remove undefined values
    const filteredParams = Object.entries(cleanParams).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {} as any);

    const response = await api.get(USER_AUTH_ENDPOINTS.userMovies, { params: filteredParams });

    return {
      movies: response.data.data.movies || [],
      totalCount: response.data.data.totalCount || 0,
      totalPages: response.data.data.totalPages || 0,
      currentPage: response.data.data.currentPage || 1,
    };
  } catch (error) {
    handleAxiosError(error, ERROR_MESSAGES.FETCH_USER_MOVIES_FAILED);
    return null;
  }
};

/**
 * Toggle movie bookmark status
 * @param movieId - ID of the movie to bookmark/unbookmark
 * @returns Promise<BookmarkResponse | null>
 */
export const toggleMovieBookmark = async (movieId: string): Promise<BookmarkResponse | null> => {
  try {
    const response = await api.post(`${USER_AUTH_ENDPOINTS.toggleBookmark}/${movieId}`);
    
    return {
      success: true,
      movieId,
      isBookmarked: response.data.data.isBookmarked,
    };
  } catch (error) {
    handleAxiosError(error, 'Failed to toggle bookmark');
    return null;
  }
};


/**
 * Get available genres for filtering
 * @returns Promise<string[] | null>
 */
export const likeMovie = async (movieId:string,isLike:boolean): Promise<IMovie| null> => {
  try {
    const response = await api.patch(USER_AUTH_ENDPOINTS.likeMovie,{movieId,isLike});
    return response.data.data
  } catch (error) {
    handleAxiosError(error, 'Failed to like or unlike movie');
  }
};

export const isLikedMovie = async (movieId:string): Promise<boolean> => {
  try {
    const response = await api.get(`${USER_AUTH_ENDPOINTS.isLikedMovie}/${movieId}`);
    console.log("🚀 ~ isLikedMovie ~ response:", response)
    return response.data.data.isLiked
  } catch (error) {
    handleAxiosError(error, 'Faile to fetch isLiked movie');
  }
};

/**
 * Search movies with autocomplete suggestions
 * @param query - Search query string
 * @param limit - Number of suggestions to return
 * @returns Promise<any[] | null>
 */
export const searchMovieSuggestions = async (query: string, limit = 5): Promise<any[] | null> => {
  try {
    const response = await api.get(USER_AUTH_ENDPOINTS.userMovies, {
      params: { query, limit }
    });
    return response.data.data.suggestions || [];
  } catch (error) {
    handleAxiosError(error, 'Failed to fetch search suggestions');
    return null;
  }
};

/**
 * Get trending movies
 * @param params - Pagination parameters
 * @returns Promise<MovieResponse | null>
 */
export const getTrendingMovies = async (params = { page: 1, limit: 12 }): Promise<MovieResponse | null> => {
  try {
    const response = await api.get(USER_AUTH_ENDPOINTS.userMovies, { params });
    
    return {
      movies: response.data.data.movies || [],
      totalCount: response.data.data.totalCount || 0,
      totalPages: response.data.data.totalPages || 0,
      currentPage: response.data.data.currentPage || 1,
    };
  } catch (error) {
    handleAxiosError(error, 'Failed to fetch trending movies');
    return null;
  }
};



// Export all functions as default object for easier importing
export default {
  getMoviesWithFilters,
  getUserMovies,
  toggleMovieBookmark,
  getMovieDetails,
  isLikedMovie,
  likeMovie,
  searchMovieSuggestions,
  getTrendingMovies,
};