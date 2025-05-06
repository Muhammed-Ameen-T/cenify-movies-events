import axios from "axios";
import { Theater, TheaterDetailsFormData } from "../../types/theater";
import {ADMIN_ENDPOINTS, VENDOR_ENDPOINTS } from "../../constants/apiEndPoint";
const API_BASE_URL = "http://localhost:3000/api/";
// import api from "../../config/axios.config";
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const registerVendor = async (data: {
  email: string;
}): Promise<{ id: string; email: string; accountType: string }> => {
  const response = await api.post(`/vendor/send-otp`, data);
  return response.data;
};

export const verifyVendorOtp = async (data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  accountType: "theater" | "event";
  otp: string;
}): Promise<{
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; name: string; phone: number; profileImage: string; role: string };
}> => {
  const response = await api.post(`/vendor/verify-otp`, data);
  return response.data;
};

export const resendVendorOtp = async (data: { email: string }): Promise<void> => {
  await api.post("/send-otp", data);
};

export const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "olx-clone1");
  const response = await axios.post(
    "https://api.cloudinary.com/v1_1/djqsehax7/image/upload",
    formData
  );
  return response.data.secure_url;
};


export const loginTheater = async (data: {
  email: string;
  password: string;
}): Promise<{ id: string; email: string; accountType: 'theater' | 'event' }> => {
  try {
    const response = await api.post(VENDOR_ENDPOINTS.login, data,{withCredentials:true});
    return response.data;
  } catch (error) {
    // Handle Axios errors
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Login failed');
    }
    throw new Error('An unexpected error occurred');
  }
};


export const createNewTheater = async (data: Omit<TheaterDetailsFormData, 'id'>): Promise<unknown> => {
  const response = await api.post(VENDOR_ENDPOINTS.createTheater, data);
  return response.data;
};


export const fetchTheaters = async (): Promise<Theater[]> => {
  const response = await axios.get('http://localhost:3000/api/vendor/fetch-theaters');
  const theaters = response.data.data as Array<{
    id: string;
    name: string;
    status: string;
    location: { city: string | null; coordinates: number[] | null; type: string | null } | null;
    facilities: {
      foodCourt: boolean | null;
      lounges: boolean | null;
      mTicket: boolean | null;
      parking: boolean | null;
      freeCancellation: boolean | null;
    } | null;
    intervalTime: number | null;
    gallery: string[] | null;
    email: string | null;
    phone: string | null;
    rating: number | null;
    accountType: string;
    createdAt: string | null;
    updatedAt: string | null;
  }>;

  // Map backend response to Theater type
  return theaters.map((theater) => ({
    id: theater.id,
    name: theater.name,
    status: theater.status, 
    location: theater.location?.city ? `${theater.location.city}` : 'Unknown Location',
    address: 'Not provided', // Mocked, extend backend DTO if needed
    phone: theater.phone || 'Not provided',
    email: theater.email || 'Not provided',
    website: 'www.example.com', // Mocked
    openingHours: '10:00 AM - 12:00 AM', // Mocked
    features: theater.facilities
      ? Object.entries(theater.facilities)
          .filter(([_, value]) => value)
          .map(([key]) =>
            key === 'foodCourt'
              ? 'Food Court'
              : key === 'lounges'
              ? 'Lounges'
              : key === 'mTicket'
              ? 'Mobile Ticket'
              : key === 'parking'
              ? 'Parking'
              : 'Free Cancellation',
          )
      : ['DOLBY ATMOS', '4K'], 
    description: 'Premium theater with modern amenities.', 
    images: theater.gallery?.length ? theater.gallery : ['/api/placeholder/600/400'],
    rating: theater.rating || 4, 
    reviewCount: 131, 
    screens: [
      { name: 'Screen 1', capacity: 200, features: ['DOLBY ATMOS', '4K'] },
      { name: 'Screen 2', capacity: 150, features: ['3D'] },
    ],
    coordinates: Array.isArray(theater.location?.coordinates) && theater.location.coordinates.length === 2
      ? (theater.location.coordinates as [number, number])
      : undefined
  }));
};

export const updateTheaterStatus = async (id: string, status: string): Promise<void> => {
  await axios.patch(`http://localhost:3000/api/vendor/update-theater-status/${id}`, { status });
};

export const requestPasswordReset = async ({ email }: { email: string }) => {
  const response = await api.post('http://localhost:3000/api/auth/fg-send-otp', { email });
  return response.data;
};

export const verifyResetOtp = async ({ email, otp }: { email: string; otp: string }) => {
  const response = await api.post('http://localhost:3000/api/auth/fg-verify-otp', { email, otp });
  return response.data;
};

export const updatePassword = async ({
  email,
  password,
  confirmPassword,
}: {
  email: string;
  password: string;
  confirmPassword: string;
}) => {
  const response = await axios.post('http://localhost:3000/api/auth/fg-update-pass', {
    email,
    password,
    confirmPassword,
  });
  return response.data;
};



export const createEvent = async (data: {
  name: string;
  date: string;
  time: string;
  theaterId: string;
  ticketPrice: number;
}) => {
  // Axios POST to /api/vendor/events
};

export const createTheater = async (data: {
  name: string;
  location: string;
  rows: number;
  seatsPerRow: number;
  seatLayout: string[][];
}) => {
  // Axios POST to /api/vendor/theaters
};

export default api; 