export interface LocationData {
  lat: number;
  lng: number;
}

export interface TheaterFacilities {
  foodCourt: boolean;
  lounges: boolean;
  mTicket: boolean;
  parking: boolean;
  freeCancellation: boolean;
}

// Define the theater details that will be sent
export interface TheaterDetailsFormData {
  id: string;
  name: string;
  location: { city: string; coordinates: number[]; type: string };
  facilities: {
    foodCourt: boolean;
    lounges: boolean;
    mTicket: boolean;
    parking: boolean;
    freeCancellation: boolean;
  };
  intervalTime: string;
  gallery: string[];
  description: string;
  email: string;
  phone: string;
}

// Define the expected structure of the API response
export interface TheaterResponse {
  success: boolean;
  message: string;
  theater: TheaterDetailsFormData;
}


export interface TheaterUpdatePayload {
  id: string;
  name: string;
  location: {
    city: string;
    coordinates: [number, number];
    type: string;
  };
  facilities: TheaterFacilities;
  intervalTime: string;
  gallery: string[];
}

// src/types/theater.ts
// src/types/theater.ts
export interface Theater {
  id: string;
  name: string;
  status: string;
  location: string;
  address?: string;
  phone: string;
  email: string;
  website?: string;
  openingHours?: string;
  features: string[];
  description?: string;
  images: string[];
  rating: number;
  reviewCount?: number;
  screens?: Array<{ name: string; capacity: number; features: string[] }>;
  coordinates?: [number, number];
  createdAt: Date;
  updatedAt: Date;
  vendorId?: { // ✅ Updated vendor type
    id: string;
    name: string;
    email: string;
    phone: string;
  } | null; // ✅ Now allows null values
}
