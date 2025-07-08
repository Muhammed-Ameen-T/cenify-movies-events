import axios from "axios";
import { Theater,ITheater, TheaterDetailsFormData } from "../../types/theater";
import { VENDOR_ENDPOINTS } from "../../constants/apiEndPoint";
import api from "../../config/axios.config";


export const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "olx-clone1");
  const response = await axios.post(VENDOR_ENDPOINTS.imageUpload,formData);
  return response.data.secure_url;
};


export const createNewTheater = async (data: Omit<TheaterDetailsFormData, 'id'>): Promise<unknown> => {
  const response = await api.post(VENDOR_ENDPOINTS.createTheater, data);
  return response.data;
};


export const fetchTheaters = async (): Promise<Theater[]> => {
  const response = await api.get(VENDOR_ENDPOINTS.fetchTheaters);
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
    description: string;
    intervalTime: number | null;
    gallery: string[] | null;
    email: string | null;
    phone: string | null;
    rating: number | null;
    vendorId: {
      id: string;
      name: string;
      email: string;
      phone: string;
    } | null;
    createdAt: string | null;
    updatedAt: string | null;
  }>;
  
  console.log("🚀 ~ fetchTheaters ~ theaters:", theaters)
  // Map backend response to Theater type
  return theaters.map((theater) => ({
    id: theater.id,
    name: theater.name,
    status: theater.status, 
    location: theater.location?.city ? `${theater.location.city}` : 'Unknown Location',
    address: 'Not provided',
    phone: theater.phone || 'Not provided',
    email: theater.email || 'Not provided',
    website: 'www.example.com', 
    openingHours: '10:00 AM - 12:00 AM',
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
    description: theater.description, 
    images: theater.gallery?.length ? theater.gallery : ['/api/placeholder/600/400'],
    rating: theater.rating || 4, 
    reviewCount: 131, 
    vendorId: theater.vendorId ? {
      id: theater.vendorId.id,
      name: theater.vendorId.name,
      email: theater.vendorId.email,
      phone: theater.vendorId.phone,
    } : undefined,
    screens: [
      { name: 'Screen 1', capacity: 200, features: ['DOLBY ATMOS', '4K'] },
      { name: 'Screen 2', capacity: 150, features: ['3D'] },
    ],
    coordinates: Array.isArray(theater.location?.coordinates) && theater.location.coordinates.length === 2
      ? (theater.location.coordinates as [number, number])
      : undefined,
    createdAt: theater.createdAt ? new Date(theater.createdAt) : new Date(),
    updatedAt: theater.updatedAt ? new Date(theater.updatedAt) : new Date()
  }));
};

interface FetchTheatersResponse {
  theaters: ITheater[];
  totalCount: number;
  totalPages: number;
}

export const fetchTheatersByVendor = async (params: {
  vendorId: string;
  page?: number;
  limit?: number;
  search?: string;
  status?: string[];
  location?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<FetchTheatersResponse> => {
  const response = await api.get(`${VENDOR_ENDPOINTS.fetchTheater}/${params.vendorId}`, { params });
  return response.data.data;
};

export const updateTheaterStatus = async (id: string, status: string): Promise<void> => {
  await api.patch(`${VENDOR_ENDPOINTS.updateStatus}${id}`, { status });
};

export const updateTheater = async (id: string, data: Partial<Theater>): Promise<Theater> => {
  const response = await api.patch(`${VENDOR_ENDPOINTS.updateTheater}/${id}`, data);
  return response.data.data;
};


export default api; 