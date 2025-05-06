import axios from "axios";
import { Theater, TheaterDetailsFormData } from "../../types/theater";
import { VENDOR_ENDPOINTS } from "../../constants/apiEndPoint";
import api from "../../config/axios.config";
// const API_BASE_URL = "http://localhost:3000/api/";


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






export default api; 