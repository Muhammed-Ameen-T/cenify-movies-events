import api from '../../config/axios.config';
import { handleAxiosError } from '../../utils/exios-error-handler';
import { USER_ENDPOINTS } from '../../constants/apiEndPoint';
import { ERROR_MESSAGES } from '../../constants/auth.messages';
import { MoviePassHistory } from '../../types/user';

export interface MoviePassData {
  _id: string;
  userId: string;
  status: 'Active' | 'Inactive';
  history: Array<{ title: string; date: string; saved: number }>;
  purchaseDate: string;
  expireDate: string;
  moneySaved: number;
  totalMovies: number;
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutSessionResponse {
  sessionId: string;
}

export const getMoviePass = async (): Promise<MoviePassData | null> => {
  try {
    const response = await api.get(USER_ENDPOINTS.getMoviePass);
    if (!response.data?.success) {
      throw new Error(response.data?.message || ERROR_MESSAGES.FETCH_MOVIE_PASS_FAILED);
    }
    return response.data.data || null;
  } catch (error) {
    handleAxiosError(error, ERROR_MESSAGES.FETCH_MOVIE_PASS_FAILED);
  }
};

export const createCheckoutSession = async (): Promise<CheckoutSessionResponse> => {
  try {
    const response = await api.post(USER_ENDPOINTS.createCheckoutSession);
    if (!response.data?.success) {
      throw new Error(response.data?.message || ERROR_MESSAGES.CREATE_CHECKOUT_FAILED);
    }
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, ERROR_MESSAGES.CREATE_CHECKOUT_FAILED);
  }
};


export interface MoviePassHistoryResponse {
  history: MoviePassHistory[];
  total: number;
}

export const getMoviePassHistory = async ({
  page,
  limit,
}: {
  page: number;
  limit: number;
}): Promise<MoviePassHistoryResponse> => {
  try {
    const response = await api.get(USER_ENDPOINTS.getMoviePassHistory, {
      params: { page, limit },
    });
    if (!response.data?.success) {
      throw new Error(response.data?.message || ERROR_MESSAGES.FETCH_MOVIE_PASS_HISTORY_FAILED);
    }
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, ERROR_MESSAGES.FETCH_MOVIE_PASS_HISTORY_FAILED);
  }
};