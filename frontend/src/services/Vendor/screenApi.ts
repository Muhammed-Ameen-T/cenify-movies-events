import { Screen } from '../../types/screen';
import api from '../../config/axios.config';
import { VENDOR_ENDPOINTS } from '../../constants/apiEndPoint';
import { ERROR_MESSAGES } from '../../constants/auth.messages';
import { SeatLayoutResponse } from '../../types/seatLayout';
interface FetchScreensParams {
  page: number;
  limit: number;
  search?: string;
  theaterId?: string;
  sortBy?: string;
  sortOrder?: string;
}

export const fetchScreensByVendor = async (params: FetchScreensParams): Promise<{
  screens: Screen[];
  totalCount: number;
  totalPages: number;
}> => {
  try {
    const response = await api.get(`${VENDOR_ENDPOINTS.fetchScreensByVendor}`, { params });
    return response.data.data;
  } catch (error) {  
    throw new Error(ERROR_MESSAGES.NETWORK_ERROR || String(error));
  }
};

export const createScreen = async (data: any): Promise<void> => {
  try {
    const response = await api.post(VENDOR_ENDPOINTS.createScreen, data);
    return response.data;
  } catch (error) {
    console.error("Error creating screen:", error);
    const errorMessage = error.response?.data?.message || ERROR_MESSAGES.CREATING_SCREEN_FAILED;
    throw new Error(errorMessage);
  }
};

export const updateScreen = async (id: string, data: any): Promise<void> => {
  try {
    const response = await api.put(`${VENDOR_ENDPOINTS.updateScreen}/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error("Error updating screen:", error);
    const errorMessage = error.response?.data?.message || ERROR_MESSAGES.UPDATING_SCREEN_FAILED;
    throw new Error(errorMessage);
  }
};


export const fetchSeatLayouts = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<SeatLayoutResponse[]> => {
  try {
    const response = await api.get(VENDOR_ENDPOINTS.fetchSeatLayouts, { params });
    return response.data.data.seatLayouts;
  } catch (error) {
    throw new Error(ERROR_MESSAGES.NETWORK_ERROR || String(error));
  }
};