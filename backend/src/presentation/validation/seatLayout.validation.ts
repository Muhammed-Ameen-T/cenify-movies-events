import { z } from 'zod';

export const createSeatLayoutSchema = z.object({
  uuid: z.string().uuid('Invalid layout UUID format'),
  vendorId: z.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
    message: 'Invalid vendorId format',
  }),
  layoutName: z.string().min(3, 'Layout name must be at least 3 characters'),
  seatPrice: z.object({
    regular: z.number().min(0, 'Regular seat price must be non-negative'),
    premium: z.number().min(0, 'Premium seat price must be non-negative'),
    vip: z.number().min(0, 'VIP seat price must be non-negative'),
  }),
  rowCount: z.number().int().min(1, 'Row count must be a positive integer'),
  columnCount: z.number().int().min(1, 'Column count must be a positive integer'),
  seats: z
    .array(
      z.object({
        uuid: z.string().uuid('Invalid seat UUID format'),
        type: z.enum(['regular', 'premium', 'vip', 'unavailable']),
        row: z.number().int().min(0, 'Row must be non-negative'),
        column: z.number().int().min(0, 'Column must be non-negative'),
        number: z.string().min(1, 'Seat number is required'),
      }),
    )
    .refine(
      (seats) => {
        const seatNumbers = seats.map((s) => s.number);
        return seatNumbers.length === new Set(seatNumbers).size;
      },
      { message: 'Seat numbers must be unique' },
    )
    .refine(
      (seats) => {
        const seatUuids = seats.map((s) => s.uuid);
        return seatUuids.length === new Set(seatUuids).size;
      },
      { message: 'Seat UUIDs must be unique' },
    )
    .refine(
      (seats) => {
        return seats.every(
          (seat) => seat.row < (this as any).rowCount && seat.column < (this as any).columnCount,
        );
      },
      { message: 'Seat positions must be within rowCount and columnCount' },
    ),
});
