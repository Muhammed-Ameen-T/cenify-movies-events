// src/services/Vendor/theaterApi.ts
import { Theater } from '../../types/theater';
import api from "../../config/axios.config";
import { ADMIN_ENDPOINTS } from '../../constants/apiEndPoint';

interface FetchTheatersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string[];
  features?: string[];
  rating?: number;
  location?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}           

export const fetchAdminTheaters = async (params: FetchTheatersParams = {}): Promise<{
  theaters: Theater[];
  totalCount: number;
}> => {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.limit) queryParams.set('limit', params.limit.toString());
    if (params.search) queryParams.set('search', params.search);
    if (params.status && params.status.length > 0) queryParams.set('status', params.status.join(','));
    if (params.features && params.features.length > 0) queryParams.set('features', params.features.join(','));
    if (params.rating) queryParams.set('rating', params.rating.toString());
    if (params.location) queryParams.set('location', params.location);
    if (params.sortBy) queryParams.set('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.set('sortOrder', params.sortOrder);

    const response = await api.get(`${ADMIN_ENDPOINTS.fetchTheaters}?${queryParams.toString()}`);
    const { theaters, totalCount } = response.data.data;

    // Map backend response to Theater type
    return {
      theaters: theaters.map((theater: any) => ({
        id: theater.id,
        name: theater.name,
        status: theater.status,
        location: theater.location?.city ? `${theater.location.city}` : 'Unknown Location',
        address: 'Not provided', // Static fallback, adjust if backend provides address
        phone: theater.phone || 'Not provided',
        email: theater.email || 'Not provided',
        website: 'www.example.com', // Static fallback
        openingHours: '10:00 AM - 12:00 AM', // Static fallback
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
                  : 'Free Cancellation'
              )
          : ['DOLBY ATMOS', '4K'], // Fallback features
        description: theater.description || 'No description available',
        images: theater.gallery?.length ? theater.gallery : ['/api/placeholder/600/400'],
        rating: theater.rating ?? 0,
        ratingCount: theater.ratingCount ?? 0,
        vendorId: theater.vendorId
          ? {
              id: theater.vendorId.id,
              name: theater.vendorId.name,
              email: theater.vendorId.email,
              phone: theater.vendorId.phone,
            }
          : undefined,
        screens: [], // Adjust if backend provides screen data
        coordinates: Array.isArray(theater.location?.coordinates) &&
        theater.location.coordinates.length === 2
          ? (theater.location.coordinates as [number, number])
          : undefined,
        createdAt: theater.createdAt ? new Date(theater.createdAt) : new Date(),
        updatedAt: theater.updatedAt ? new Date(theater.updatedAt) : new Date(),
      })),
      totalCount,
    };
  } catch (error) {
    console.error('Error fetching theaters:', error);
    throw new Error('Failed to fetch theaters');
  }
};

