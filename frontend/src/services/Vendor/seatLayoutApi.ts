import { AxiosError } from 'axios';
import { VENDOR_ENDPOINTS } from '../../constants/apiEndPoint';
import api from '../../config/axios.config';
import { CreateSeatLayoutRequest, SeatLayoutResponse, ApiResponse } from '../../types/seatLayout';
import { ERROR_MESSAGES } from '../../constants/auth.messages';

class ApiError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export const createNewSeatLayout = async (data: any): Promise<unknown> => {
  try {
    const response = await api.post<ApiResponse>(VENDOR_ENDPOINTS.createLayout, data);

    if (!response.data.success) {
      throw new ApiError(response.data.message, response.status);
    }

    return response.data.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      const message = error.response.data?.message || ERROR_MESSAGES.FAILED_CREATE_LAYOUT;
      throw new ApiError(message, error.response.status);
    }
    throw new ApiError(ERROR_MESSAGES.NETWORK_ERROR, 500);
  }
};
