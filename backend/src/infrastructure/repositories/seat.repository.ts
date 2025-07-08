import { ISeatRepository } from '../../domain/interfaces/repositories/seat.repository';
import { Seat } from '../../domain/entities/seatLayout.entity';
import SeatModel from '../database/seat.model';
import ERROR_MESSAGES from '../../utils/constants/commonErrorMsg.constants';
import mongoose from 'mongoose';
import { Types } from 'mongoose';

export class SeatRepository implements ISeatRepository {
  async findSeatsByLayoutId(layoutId: string): Promise<Seat[]> {
    try {
      const seatDocs = await SeatModel.find({ seatLayoutId: layoutId }).lean();
      return seatDocs.map(this.mapToEntity);
    } catch (error) {
      console.error('❌ Error finding seats:', error);
      throw new Error(ERROR_MESSAGES.GENERAL.FAILED_FINDING_SEATS);
    }
  }

  async findSeatsByIds(layoutId: string, seatIds: string[]): Promise<Seat[]> {
    try {
      const seatDocs = await SeatModel.find({
        seatLayoutId: layoutId,
        _id: { $in: seatIds.map((id) => new mongoose.Types.ObjectId(id)) },
      }).lean();

      return seatDocs.map(this.mapToEntity);
    } catch (error) {
      console.error('❌ Error finding seats:', error);
      throw new Error(ERROR_MESSAGES.GENERAL.FAILED_FINDING_SEATS);
    }
  }

  async findSeatNumbersByIds(seatIds: Types.ObjectId[]): Promise<string[]> {
    try {
      const seatDocs = await SeatModel.find(
        {
          _id: { $in: seatIds.map((id) => id) },
        },
        { number: 1 }, // Only return the seatNumber field
      ).lean();

      return seatDocs.map((seat) => seat.number);
    } catch (error) {
      console.error('❌ Error finding seat numbers:', error);
      throw new Error(ERROR_MESSAGES.GENERAL.FAILED_FINDING_SEATS);
    }
  }

  async findSeatsByIdsSession(
    layoutId: string,
    seatIds: string[],
    session?: mongoose.ClientSession,
  ): Promise<Seat[]> {
    try {
      const query = SeatModel.find({
        seatLayoutId: layoutId,
        _id: { $in: seatIds.map((id) => new mongoose.Types.ObjectId(id)) },
      });
      if (session) {
        query.session(session);
      }
      const seatDocs = await query.lean();
      return seatDocs.map(this.mapToEntity);
    } catch (error) {
      console.error('❌ Error finding seats:', error);
      throw new Error(ERROR_MESSAGES.GENERAL.FAILED_FINDING_SEATS);
    }
  }

  private mapToEntity(doc: any): Seat {
    return new Seat(
      doc._id?.toString(),
      doc.uuid,
      doc.seatLayoutId,
      doc.number,
      doc.type,
      doc.price,
      doc.position,
    );
  }
}
