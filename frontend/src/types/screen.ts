import { z } from 'zod';

export interface Screen {
  _id: string;
  name: string;
  theaterId: {
    _id: string;
    name: string;
    location: { city: string };
    gallery?: string[];
  };
  seatLayoutId: {
    _id: string;
    name: string;
    capacity: number;
  };
  amenities: {
    is3D: boolean;
    is4K: boolean;
    isDolby: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export const screenUpdateSchema = z.object({
  name: z.string().min(3, 'Screen name must be at least 3 characters').max(100, 'Screen name must be less than 100 characters'),
  theaterId: z.string().nonempty('Theater is required'),
  seatLayoutId: z.string().nonempty('Seat layout is required'),
  amenities: z.object({
    is3D: z.boolean().optional(),
    is4K: z.boolean().optional(),
    isDolby: z.boolean().optional(),
  }),
});

export type ScreenUpdateFormData = z.infer<typeof screenUpdateSchema>;


export const screenFormSchema = z.object({
  name: z.string().min(1, 'Screen name is required').max(100, 'Screen name must be 100 characters or less'),
  theaterId: z.string().min(1, 'Theater is required'),
  seatLayoutId: z.string().min(1, 'Seat layout is required'),
  amenities: z.object({
    is4K: z.boolean(),
    is3D: z.boolean(),
    isDolby: z.boolean(),
  }),
});

export type ScreenFormData = z.infer<typeof screenFormSchema>;