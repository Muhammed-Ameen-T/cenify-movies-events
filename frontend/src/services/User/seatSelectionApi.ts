// src/services/User/seatSelectionApi.ts
import api from '../../config/axios.config';
import { USER_ENDPOINTS } from '../../constants/apiEndPoint';
import { SeatSelectionResponseDTO } from '../../types/seatSelection';
import { handleAxiosError } from '../../utils/exios-error-handler';

export const fetchSeatSelection = async (showId: string): Promise<SeatSelectionResponseDTO> => {
  try {
    const response = await api.get(`${USER_ENDPOINTS.getSeats}/${showId}`);
    console.log("🚀 ~ fetchSeatSelection ~ response:", response)
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Failed to fetch seat selection');
    }
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, 'Failed to fetch seat selection');
  }
};

export const selectSeats = async (showId: string, seatIds: string[]): Promise<{ selectedSeats: { seatId: string; seatNumber: string; price: number; type: string }[] }> => {
  try {
    const response = await api.post(`${USER_ENDPOINTS.selectSeats}/${showId}/select`, { seatIds });
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Failed to select seats');
    }
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, 'Failed to select seats');
  }
};