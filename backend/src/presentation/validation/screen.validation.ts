import { z } from 'zod';

// Schema for CreateScreenDTO
export const CreateScreenSchema = z.object({
  name: z.string().min(1, 'Screen name is required'),
  theaterId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid theaterId format'),
  seatLayoutId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid seatLayoutId format'),
  amenities: z
    .object({
      is3D: z.boolean().optional(),
      is4K: z.boolean().optional(),
      isDolby: z.boolean().optional(),
    })
    .optional(),
});

// Schema for UpdateScreenDTO
export const UpdateScreenSchema = z.object({
  name: z.string().min(1, 'Screen name must not be empty').optional(),
  theaterId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid theaterId format')
    .optional(),
  seatLayoutId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid seatLayoutId format')
    .optional(),
  amenities: z
    .object({
      is3D: z.boolean().optional(),
      is4K: z.boolean().optional(),
      isDolby: z.boolean().optional(),
    })
    .optional(),
});
