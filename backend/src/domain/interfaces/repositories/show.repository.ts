import mongoose from 'mongoose';
import { ShowSelectionResponseDTO } from '../../../application/dtos/show.dto';
import { Show } from '../../entities/show.entity';

export interface IShowRepository {
  create(show: Show): Promise<Show>;
  update(show: Show, existingShowStartTime: Date): Promise<Show>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Show | null>;
  updateStatus(
    id: string,
    status: 'Scheduled' | 'Running' | 'Completed' | 'Cancelled',
  ): Promise<Show>;
  findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    theaterId?: string;
    movieId?: string;
    screenId?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ shows: Show[]; totalCount: number }>;
  findShowsByVendor(params: {
    vendorId: string;
    page?: number;
    limit?: number;
    search?: string;
    theaterId?: string;
    movieId?: string;
    screenId?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ shows: Show[]; totalCount: number }>;
  findShowSelection(params: {
    movieId: string;
    latitude: number;
    longitude: number;
    selectedLocation: string;
    date: string;
    priceRanges?: { min: number; max: number }[];
    timeSlots?: { start: string; end: string }[];
    facilities?: string[];
  }): Promise<ShowSelectionResponseDTO>;
  updateBookedSeats(
    showId: string,
    bookedSeats: {
      date: Date;
      isPending: boolean;
      seatNumber: string;
      seatPrice: number;
      type: string;
      position: { row: number; col: number };
      userId: string;
    }[],
  ): Promise<Show>;
  pullExpiredSeats(showId: string): Promise<void>;
  confirmBookedSeats(showId: string, seatNumbers: string[]): Promise<Show>;
  findByIdSession(id: string, session?: mongoose.ClientSession): Promise<Show | null>;
  updateBookedSeatsSession(
    showId: string,
    bookedSeats: any[],
    session?: mongoose.ClientSession,
  ): Promise<void>;
}
