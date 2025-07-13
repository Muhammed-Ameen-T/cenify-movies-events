import mongoose from 'mongoose';
import { Screen } from '../../entities/screen.entity';

export interface IScreenRepository {
  create(screen: Screen): Promise<Screen>;
  findById(id: string): Promise<Screen | null>;
  findScreenByName(
    name: string | undefined,
    theaterId: string | undefined,
    screenId?: string,
  ): Promise<Screen | null>;
  updateScreenDetails(screen: Screen): Promise<Screen>;
  findScreensByVendor(params: {
    vendorId: string;
    page?: number;
    limit?: number;
    search?: string;
    theaterId?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ screens: Screen[]; totalCount: number }>;
  checkSlot(
    screenId: string,
    startTime: Date,
    endTime: Date,
    excludeShowId?: string,
  ): Promise<boolean>;
  findByIdSession(id: string, session?: mongoose.ClientSession): Promise<Screen | null>;
}
