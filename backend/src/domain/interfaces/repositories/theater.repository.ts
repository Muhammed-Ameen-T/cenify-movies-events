import { Theater } from '../../entities/theater.entity';
import { FetchTheatersParams } from '../../types/theater';

export interface ITheaterRepository {
  create(Theater: Theater): Promise<Theater>;
  findById(id: string): Promise<Theater | null>;
  findByEmail(email: string): Promise<Theater | null>;
  updateVerificationStatus(id: string, Theater: Theater): Promise<Theater>;
  updateTheaterDetails(Theater: Theater): Promise<Theater>;
  findTheaters(): Promise<Theater[]>;
  findEvents(): Promise<Theater[]>;
  updateScreens(
    theaterId: string,
    screenId: string,
    action: 'push' | 'pull',
  ): Promise<Theater | null>;
  findTheatersByVendor(params: {
    vendorId: string;
    page?: number;
    limit?: number;
    search?: string;
    status?: string[];
    location?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ theaters: Theater[]; totalCount: number }>;
  addRating(theaterId: string, newRating: number): Promise<Theater>;
  findAdminTheaters(params: FetchTheatersParams): Promise<{
    theaters: Theater[];
    totalCount: number;
  }>;
}
