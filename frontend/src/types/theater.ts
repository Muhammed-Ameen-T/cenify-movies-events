import { z } from 'zod';
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
export interface  Theater {
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


export interface ITheater {
  _id: string;
  name: string;
  status: 'verified' | 'verifying' | 'blocked';
  location: {
    city: string;
    coordinates: [number, number];
    type: string;
  };
  facilities: {
    foodCourt: boolean;
    lounges: boolean;
    mTicket: boolean;
    parking: boolean;
    freeCancellation: boolean;
  };
  createdAt: string;
  updatedAt: string;
  intervalTime: number;
  gallery: string[];
  email: string;
  phone: number;
  description: string;
  vendorId: {
    _id: string;
    name: string;
    email: string;
    phone: number;
  };
  rating: number;
  screens: any[]; // Adjust based on screen structure if needed
}

export const theaterUpdateSchema = z.object({
  name: z.string().min(1, 'Theater name is required'),
  location: z.object({
    city: z.string().min(1, 'City is required'),
  }),
  email: z.string().email('Invalid email address'),
  phone: z.number().min(1000000000, 'Phone number must be at least 10 digits').max(999999999999, 'Phone number is too long'),
  description: z.string().min(1, 'Description is required'),
  intervalTime: z.number().min(1, 'Interval time must be at least 1 minute'),
  facilities: z.object({
    foodCourt: z.boolean(),
    lounges: z.boolean(),
    mTicket: z.boolean(),
    parking: z.boolean(),
    freeCancellation: z.boolean(),
  }),
});

export type TheaterUpdateFormData = z.infer<typeof theaterUpdateSchema>;


import { SeatType } from '../constants/seatTypes';

export interface Seat {
  id: string;
  row: number;
  col: number;
  type: SeatType;
  price: number;
  label: string;
  occupied: boolean;
}

export interface HistoryState {
  history: Seat[][];
  currentIndex: number;
  present: Seat[][] | null;
}

export type HistoryAction = 
  | { type: 'SET_INITIAL'; payload: Seat[][] }
  | { type: 'UPDATE'; payload: Seat[][] }
  | { type: 'UNDO' }
  | { type: 'REDO' };

export interface PriceEditData {
  seatType: SeatType;
  price: number;
}