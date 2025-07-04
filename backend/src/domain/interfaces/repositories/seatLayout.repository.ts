// src/domain/interfaces/repositories/seatLayout.repository.ts
import mongoose from 'mongoose';
import { SeatLayout, Seat } from '../../../domain/entities/seatLayout.entity';

export interface ISeatLayoutRepository {
  findByVendor(params: {
    vendorId: string;
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ seatLayouts: any[]; totalCount: number }>;
  create(seatLayout: SeatLayout): Promise<SeatLayout>;
  createSeats(seats: Seat[]): Promise<Seat[]>;
  // New methods
  update(seatLayout: SeatLayout): Promise<SeatLayout>;
  replaceSeats(seatLayoutId: mongoose.Types.ObjectId, seats: Seat[]): Promise<Seat[]>;
  findById(id: string): Promise<SeatLayout | null>;
}
