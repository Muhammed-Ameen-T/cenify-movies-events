import { z } from 'zod';

export const CreateShowSchema = z.object({
  theaterId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid theaterId format'),
  screenId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid screenId format'),
  movieId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid movieId format'),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format, must be a valid date',
  }),
  showTimes: z
    .array(
      z.object({
        startTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
          message: 'Invalid startTime format, must be a valid date',
        }),
        endTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
          message: 'Invalid endTime format, must be a valid date',
        }),
      }),
    )
    .min(1, 'At least one showTime is required')
    .refine(
      (showTimes) => {
        for (let i = 0; i < showTimes.length; i++) {
          for (let j = i + 1; j < showTimes.length; j++) {
            const startA = new Date(showTimes[i].startTime).getTime();
            const endA = new Date(showTimes[i].endTime).getTime();
            const startB = new Date(showTimes[j].startTime).getTime();
            const endB = new Date(showTimes[j].endTime).getTime();

            if (
              (startB >= startA && startB < endA) || // Overlaps within an existing show
              (endB > startA && endB <= endA) || // Ends within an existing show
              (startA >= startB && startA < endB) // Existing show overlaps with a new one
            ) {
              return false;
            }
          }
        }
        return true;
      },
      { message: 'ShowTimes cannot have overlapping times' },
    ),
});

export const UpdateShowSchema = z.object({
  body: z.object({
    startTime: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid startTime format, must be a valid date',
      })
      .optional(),
    movieId: z.string().min(1, 'movieId is required').optional(),
    theaterId: z.string().min(1, 'theaterId is required').optional(),
    screenId: z.string().min(1, 'screenId is required').optional(),
    status: z.enum(['Scheduled', 'Running', 'Completed', 'Cancelled']).optional(),
    bookedSeats: z
      .array(
        z.object({
          date: z.string().refine((val) => !isNaN(Date.parse(val)), {
            message: 'Invalid date format',
          }),
          isPending: z.boolean().optional(),
          seatNumber: z.string().min(1, 'seatNumber is required'),
          seatPrice: z.number().min(0, 'seatPrice must be non-negative'),
          type: z.enum(['VIP', 'Regular', 'Premium']),
          position: z.object({
            row: z.number().int().min(0, 'row must be a non-negative integer'),
            col: z.number().int().min(0, 'col must be a non-negative integer'),
          }),
          userId: z.string().min(1, 'userId is required'),
        }),
      )
      .optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'Show ID is required'),
  }),
});

export const UpdateShowStatusSchema = z.object({
  body: z.object({
    status: z.enum(['Scheduled', 'Running', 'Completed', 'Cancelled'], {
      errorMap: () => ({ message: 'Invalid status' }),
    }),
  }),
  params: z.object({
    id: z.string().min(1, 'Show ID is required'),
  }),
});
