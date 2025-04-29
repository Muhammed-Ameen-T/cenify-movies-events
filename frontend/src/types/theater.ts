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

export interface TheaterDetailsFormData {
  facilities: TheaterFacilities;
  intervalTime: string;
  location: LocationData;
  city: string;
  images: string[];
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
}