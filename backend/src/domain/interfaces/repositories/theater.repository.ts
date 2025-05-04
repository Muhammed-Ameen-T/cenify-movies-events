import { Theater } from '../../entities/theater.entity';

export interface ITheaterRepository {
  create(Theater: Theater): Promise<Theater>;
  findById(id: string): Promise<Theater | null>;
  findByEmail(email: string): Promise<Theater | null>;
  updateVerificationStatus(id: string, Theater: Theater): Promise<Theater>;
  updateTheaterDetails(Theater: Theater): Promise<Theater>;
  findTheaters(): Promise<Theater[]>; // New method
  findEvents(): Promise<Theater[]>; // New method
}
