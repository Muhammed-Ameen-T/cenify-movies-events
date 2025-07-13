// services/User/bookingApi.ts
import api from '../../config/axios.config';
import { USER_ENDPOINTS } from '../../constants/apiEndPoint';
import { ERROR_MESSAGES } from '../../constants/auth.messages';
import { Booking } from '../../types';
import { BookingData, PaymentOptions, CreateBookingPayload, CreateBookingResponse } from '../../types/booking';
import { handleAxiosError } from '../../utils/exios-error-handler';

interface FindUserBookingsParams {
  page: number;
  limit: number;
  status?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

interface FindUserBookingsResponse {
  bookings: Booking[];
  totalCount: number;
  totalPages: number;
}

export async function findUserBookings(params: FindUserBookingsParams): Promise<FindUserBookingsResponse> {
  try {
    const { page, limit, status, sortBy, sortOrder, search } = params;

    // Build query parameters
    const queryParams: Record<string, string | number> = {
      page,
      limit,
    };

    if (status && status.length > 0) {
      queryParams.status = status.join(','); // Convert array to comma-separated string
    }

    if (sortBy) {
      queryParams.sortBy = sortBy;
    }

    if (sortOrder) {
      queryParams.sortOrder = sortOrder;
    }

    if (search) {
      queryParams.search = search;
    }

    // Make API request with query parameters
    const response = await api.get(USER_ENDPOINTS.findUserBookings, {
      params: queryParams,
    });
    console.log("🚀 ~ findUserBookings ~ response:", response)

    if (!response.data.success) {
      console.error('🚀 ~ findUserBookings ~ response:', response);
      throw new Error(response.data.message || ERROR_MESSAGES.FETCH_BOOKING_FAILED);
    }

    return {
      bookings: response.data.data.bookings,
      totalCount: response.data.data.totalCount,
      totalPages: response.data.data.totalPages,
    };
  } catch (error) {
    throw handleAxiosError(error, ERROR_MESSAGES.FETCH_BOOKING_FAILED);
  }
}

export const BookingService = {
  async getShowDetails(showId: string): Promise<BookingData> {
    try {
      const response = await api.get(`${USER_ENDPOINTS.findShowById}${showId}`);
      return response.data.data;
    } catch (error) {
      throw handleAxiosError(error, ERROR_MESSAGES.FETCH_SHOW_DETAILS_FAILED);
    }
  },

  async getPaymentOptions(totalAmount: number): Promise<PaymentOptions> {
    try {
      const response = await api.get(`${USER_ENDPOINTS.getPaymentOptions}?totalAmount=${totalAmount}`);
      return response.data.data;
    } catch (error) {
      throw handleAxiosError(error, ERROR_MESSAGES.FETCH_PAYMENT_OPTIONS_FAILED);
    }
  },

  async createBooking(payload: CreateBookingPayload): Promise<CreateBookingResponse> {
    try {
      const response = await api.post(`${USER_ENDPOINTS.createBooking}`, payload);
      return response.data.data;
    } catch (error) {
      throw handleAxiosError(error, ERROR_MESSAGES.CREATE_BOOKING_FAILED);
    }
  },

  async findBookingById(bookingId: string): Promise<CreateBookingResponse> {
    try {
      const response = await api.get(`${USER_ENDPOINTS.findBookingById}${bookingId}`);
      if (!response.data.success) {
        console.log("🚀 ~ findBookingById ~ response:", response)
        throw new Error(response.data.message || ERROR_MESSAGES.FETCH_BOOKING_FAILED);
      }
      return response.data.data;
    } catch (error) {
      throw handleAxiosError(error, ERROR_MESSAGES.FETCH_BOOKING_FAILED);
    }
  },
  
  async cancelBooking(bookingId:string,reason:string): Promise<CreateBookingResponse[]> {
    try {
      const response = await api.patch(`${USER_ENDPOINTS.cancelUserBooking}${bookingId}`,{reason});
      return response.data.data;
    } catch (error) {
      throw handleAxiosError(error, ERROR_MESSAGES.FETCH_BOOKING_FAILED);
    }
  },

  async rateMovie(movieId: string, theaterId:string, movieRating: number, theaterRating: number, review: string): Promise<void> {
    try {
      const response = await api.post(USER_ENDPOINTS.rateMovie, { movieId, theaterId, movieRating, theaterRating, review });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to submit rating');
      }
    } catch (error) {
      throw handleAxiosError(error, 'Failed to submit rating');
    }
  },

  async fetchAllBooking(): Promise<BookingData[]> {
    try {
      const response = await api.get(`${USER_ENDPOINTS.fetchAllBooking}`);
      return response.data.data;
    } catch (error) {
      throw handleAxiosError(error, ERROR_MESSAGES.FETCH_BOOKING_FAILED);
    }
  },
};




interface FindAllBookingsParams {
  page?: number;
  limit?: number;
  status?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

interface FindAllBookingsResponse {
  bookings: BookingData[];
  totalCount: number;
  totalPages: number;
}

export async function fetchAllBooking(params: FindAllBookingsParams = {}): Promise<FindAllBookingsResponse> {
  try {
    const { page, limit, status, sortBy, sortOrder, search } = params;

    const queryParams: Record<string, string | number> = {};
    if (page) queryParams.page = page;
    if (limit) queryParams.limit = limit;
    if (status && status.length > 0) queryParams.status = status.join(',');
    if (sortBy) queryParams.sortBy = sortBy;
    if (sortOrder) queryParams.sortOrder = sortOrder;
    if (search) queryParams.search = search;

    const response = await api.get(USER_ENDPOINTS.fetchAllBooking, {
      params: queryParams,
    });

    if (!response.data.success) {
      throw new Error(response.data.message || ERROR_MESSAGES.FETCH_BOOKING_FAILED);
    }

    return {
      bookings: response.data.data.bookings,
      totalCount: response.data.data.totalCount,
      totalPages: response.data.data.totalPages,
    };
  } catch (error) {
    throw handleAxiosError(error, ERROR_MESSAGES.FETCH_BOOKING_FAILED);
  }
}

export async function fetchVendorBookings(params: FindAllBookingsParams = {}): Promise<FindAllBookingsResponse> {
  try {
    const { page, limit, status, sortBy, sortOrder, search } = params;

    const queryParams: Record<string, string | number> = {};
    if (page) queryParams.page = page;
    if (limit) queryParams.limit = limit;
    if (status && status.length > 0) queryParams.status = status.join(',');
    if (sortBy) queryParams.sortBy = sortBy;
    if (sortOrder) queryParams.sortOrder = sortOrder;
    if (search) queryParams.search = search;

    const response = await api.get(USER_ENDPOINTS.fetchVendorBookings, {
      params: queryParams,
    });

    if (!response.data.success) {
      throw new Error(response.data.message || ERROR_MESSAGES.FETCH_BOOKING_FAILED);
    }

    return {
      bookings: response.data.data.bookings,
      totalCount: response.data.data.totalCount,
      totalPages: response.data.data.totalPages,
    };
  } catch (error) {
    throw handleAxiosError(error, ERROR_MESSAGES.FETCH_BOOKING_FAILED);
  }
}