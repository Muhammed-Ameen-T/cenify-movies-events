
// import { Event } from "../../types/event";
import { VENDOR_ENDPOINTS } from "../../constants/apiEndPoint";
import api from "../../config/axios.config";


// src/services/Vendor/eventApi.ts

import axios from 'axios';
import { z } from 'zod';

// Base URL for the API (replace with your actual backend URL)
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Event schema for validation (matches the schema in EventsManagement)
const eventSchema = z.object({
  Name: z.string().min(1, 'Event name is required'),
  Language: z.string().min(1, 'Language is required'),
  Theme: z.string().min(1, 'Theme is required'),
  Location: z.string().min(1, 'Location is required'),
});

// Type for the event form data
export type EventFormData = z.infer<typeof eventSchema>;

// Interface for the full event (based on IEvent)
interface Event {
  _id: string;
  Name: string;
  About: string | null;
  Language: string;
  TheaterId: string | null;
  Theme: string;
  AdultOnly: boolean | null;
  EntryFee: number | null;
  Duration: number | null;
  Facilities: string[] | null;
  Status: string | null;
  TotalCapacity: string | null;
  SlotsFilled: number;
  Artists: { name: string; role: string }[] | null;
  Date: string | null;
  Interests: string | null;
  Location: string;
  Banner: string | null;
}

// Axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    // Add authorization token if required
    // Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
});

/**
 * Creates a new event via the API
 * @param data - Event form data
 * @returns The created event
 * @throws Error if validation or API call fails
 */
export const createEvent = async (data: EventFormData): Promise<Event> => {
  try {
    // Validate input data
    const validatedData = eventSchema.parse(data);

    // Mock additional fields required by the backend
    const payload = {
      ...validatedData,
      About: null, // Can be added in the form later
      TheaterId: null, // Replace with actual theater ID if available
      AdultOnly: false,
      EntryFee: 0,
      Duration: 120, // Default duration in minutes
      Facilities: [],
      Status: 'Upcoming',
      TotalCapacity: '100', // Default capacity
      SlotsFilled: 0,
      Artists: [],
      Date: new Date().toISOString().split('T')[0], // Current date
      Interests: 'General',
      Banner: null,
    };

    // Simulate API call (replace with actual API endpoint)
    const response = await apiClient.post<Event>('/vendor/events', payload);

    return response.data;
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Handle validation errors
      throw new Error(error.errors.map((e) => e.message).join(', '));
    } else if (axios.isAxiosError(error)) {
      // Handle HTTP errors
      throw new Error(error.response?.data?.message || 'Failed to create event');
    } else {
      // Handle unexpected errors
      throw new Error('An unexpected error occurred');
    }
  }
};