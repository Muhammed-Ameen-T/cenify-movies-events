import api from '../../config/axios.config';
import { VENDOR_ENDPOINTS } from '../../constants/apiEndPoint';
import { ERROR_MESSAGES } from '../../constants/auth.messages';
import { Show, ShowTime } from '../../types/show';


interface ShowSelectionShow {
  time: string;
  status: 'available' | 'fast-filling' | 'not-available';
}

interface ShowSelectionTheater {
  id: string;
  name: string;
  rating: number;
  facilities: {
    foodCourt: boolean;
    lounges: boolean;
    mTicket: boolean;
    parking: boolean;
    freeCancellation: boolean;
  };
  images: string[];
  address: {
    city: string;
    coordinates: [number, number];
  };
  shows: ShowSelectionShow[];
}

interface ShowSelectionMovie {
  title: string;
  language: string;
  genres: string[];
  duration: string;
  rating: number;
}

interface ShowSelectionResponse {
  movie: ShowSelectionMovie | null;
  theaters: ShowSelectionTheater[];
}

interface FetchShowsParams {
  page?: number;
  limit?: number;
  search?: string;
  theaterId?: string;
  movieId?: string;
  screenId?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  vendorId?: string;
}

export const fetchShowsByVendor = async ( params: FetchShowsParams): Promise<{
  shows: Show[];
  totalCount: number;
  totalPages: number;
}> => {
  try {
    const response = await api.get(VENDOR_ENDPOINTS.fetchShowsByVendor, {
      params,
    });
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        ERROR_MESSAGES.NETWORK_ERROR ||
        String(error)
    );
  }
};

export const fetchAllShows = async ( params: any ): Promise<{
  shows: Show[];
  totalCount: number;
  totalPages: number;
}> => {
  try {
    const response = await api.get(VENDOR_ENDPOINTS.fetchAllShows, {
      params,
    });
    console.log("🚀 ~ fetchAllShows ~ response:", response)
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        ERROR_MESSAGES.NETWORK_ERROR ||
        String(error)
    );
  }
};

export const createShow = async (data: {
  theaterId: string;
  screenId: string;
  movieId: string;
  date: string;
  showTimes: ShowTime[];
}): Promise<void> => {
  try {
    const response = await api.post(VENDOR_ENDPOINTS.createShow, data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating show:', error);
    const errorMessage =
      error.response?.data?.message || ERROR_MESSAGES.CREATING_SHOW_FAILED;
    throw new Error(errorMessage);
  }
};

export const createReccuringShow = async (data: {
  showId: string;
  startDate: Date;
  endDate: Date;
}): Promise<void> => {
  try {
    const response = await api.post(VENDOR_ENDPOINTS.reccuringShow, data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating Reccuing show:', error);
    const errorMessage =
      error.response?.data?.message || ERROR_MESSAGES.CREATING_SHOW_FAILED;
    throw new Error(errorMessage);
  }
};

export const deleteShow = async (showId: string): Promise<void> => {
  try {
    await api.delete(`${VENDOR_ENDPOINTS.deleteShow}/${showId}`);
  } catch (error: any) {
    console.error('Error deleting show:', error);
    const errorMessage =
      error.response?.data?.message || 'Failed to delete show';
    throw new Error(errorMessage);
  }
};

export const findById = async (id: string): Promise<Show> => {
  try {    
    const response = await api.get(`${VENDOR_ENDPOINTS.findShowById}/${id}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching show by ID:', error);
    const errorMessage =
      error.response?.data?.message || 'Failed to fetch show';
    throw new Error(errorMessage);
  }
};


export const updateShow = async (
  id: string,
  data: {
    theaterId: string;
    screenId: string;
    movieId: string;
    date: string;
    showTimes: ShowTime[];
  }
): Promise<Show> => {
  try {
    const response = await api.put(`${VENDOR_ENDPOINTS.updateShow}/${id}`, data);
    return response.data.data;
  } catch (error: any) {
    console.error('Error updating show:', error);
    const errorMessage =
      error.response?.data?.message || 'Failed to update show';
    throw new Error(errorMessage);
  }
};

export const updateShowStatus = async (
  id: string,
  status: string
): Promise<Show> => {
  try {
    const response = await api.patch(`${VENDOR_ENDPOINTS.updateShowStatus}/${id}`, { status });
    return response.data.data;
  } catch (error: any) {
    console.error('Error updating show status:', error);
    const errorMessage =
      error.response?.data?.message || 'Failed to update show status';
    throw new Error(errorMessage);
  }
};

export const getShowSelectionService = async (
  movieId: string,
  params: {
    date: string;
    priceRanges?: { id: string; min: number; max: number }[];
    timeSlots?: { id: string; start: string; end: string }[];
    facilities?: string;
  }
): Promise<ShowSelectionResponse> => {
  try {
    const response = await api.get(`${VENDOR_ENDPOINTS.getShowSelection}/${movieId}`, {
      params: {
        date: params.date,
        priceRanges: params.priceRanges ? JSON.stringify(params.priceRanges) : undefined,
        timeSlots: params.timeSlots ? JSON.stringify(params.timeSlots) : undefined,
        facilities: params.facilities,
      },
    });
    console.log("🚀 ~ response:", response)
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching show selection:', error);
    throw new Error(
      error.response?.data?.message || ERROR_MESSAGES.NETWORK_ERROR );
  }
};