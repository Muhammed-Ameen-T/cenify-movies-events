import { SeatLayout, Seat } from '../../entities/seatLayout.entity';

export interface ISeatLayoutRepository {
  create(seatLayout: SeatLayout): Promise<SeatLayout>;
  createSeats(seats: Seat[]): Promise<Seat[]>;
}