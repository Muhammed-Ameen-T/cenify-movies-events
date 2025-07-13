// src/domain/validations/theater.validation.ts
import { z } from 'zod';

export const theaterUpdateSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').optional(),
  location: z
    .object({
      city: z.string().min(1, 'City is required'),
      coordinates: z.tuple([z.number(), z.number()]).optional(),
      type: z.string().optional(),
    })
    .optional(),
  email: z.string().email('Invalid email').optional(),
  phone: z.number().min(1000000000, 'Phone number must be valid').optional(),
  description: z.string().optional(),
  intervalTime: z.number().min(0, 'Interval time must be non-negative').optional(),
  facilities: z
    .object({
      foodCourt: z.boolean().optional(),
      lounges: z.boolean().optional(),
      mTicket: z.boolean().optional(),
      parking: z.boolean().optional(),
      freeCancellation: z.boolean().optional(),
    })
    .optional(),
  gallery: z.array(z.string().url()).optional(),
});
