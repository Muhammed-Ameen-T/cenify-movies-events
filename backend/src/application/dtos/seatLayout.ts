// src/application/dtos/seatLayout.ts
import { z } from 'zod';

// Define the seat price schema
const SeatPriceSchema = z.object({
  regular: z.number().positive(),
  premium: z.number().positive(),
  vip: z.number().positive(),
});

// Define the seat schema
const SeatSchema = z.object({
  uuid: z.string().uuid(),
  type: z.enum(['Regular', 'Premium', 'VIP', 'Unavailable']),
  position: z.object({
    row: z.number().nonnegative(),
    col: z.number().nonnegative(),
  }),
  number: z.string().min(1),
  price: z.number().nonnegative().optional(), 
});

// Define the CreateSeatLayoutDTO schema
export const CreateSeatLayoutDTOSchema = z.object({
  uuid: z.string().uuid({ message: "Invalid UUID format" }),
  vendorId: z.string().min(1, { message: "Vendor ID cannot be empty" }),
  layoutName: z.string().min(1, { message: "Layout name cannot be empty" }),
  seatPrice: SeatPriceSchema,
  rowCount: z.number()
    .positive({ message: "Row count must be a positive number" }),
  columnCount: z.number()
    .positive({ message: "Column count must be a positive number" }),
  capacity: z.number()
    .nonnegative({ message: "Capacity cannot be negative" }),
  seats: z.array(SeatSchema).min(1, { message: "At least one seat must be provided" }),
})

// Derive the TypeScript type from the schema
export type CreateSeatLayoutDTOType = z.infer<typeof CreateSeatLayoutDTOSchema>;

// Update the class to match the schema
export class CreateSeatLayoutDTO {
  constructor(
    public uuid: string,
    public vendorId: string,
    public layoutName: string,
    public seatPrice: { regular: number; premium: number; vip: number },
    public rowCount: number,
    public columnCount: number,
    public seats: {
      uuid: string;
      type: 'Regular' | 'Premium' | 'VIP' | 'Unavailable';
      position: { row: number; col: number };
      number: string;
      price?: number; // Optional price field
    }[],
    public capacity: number,
  ) {}
}