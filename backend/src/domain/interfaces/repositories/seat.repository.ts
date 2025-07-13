import { Types } from 'mongoose';
import { Seat } from '../../entities/seatLayout.entity';
import mongoose from 'mongoose';

export interface ISeatRepository {
  findSeatsByLayoutId(layoutIdd: string): Promise<Seat[]>;
  findSeatsByIds(layoutId: string, seatIds: string[]): Promise<Seat[]>;
  findSeatNumbersByIds(seatIds: Types.ObjectId[]): Promise<string[]>;
  findSeatsByIdsSession(
    layoutId: string,
    seatIds: string[],
    session?: mongoose.ClientSession,
  ): Promise<Seat[]>;
}
