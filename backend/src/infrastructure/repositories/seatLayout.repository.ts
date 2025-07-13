// src/infrastructure/database/seatLayout.repository.ts
import { injectable } from 'tsyringe';
import mongoose, { SortOrder } from 'mongoose';
import SeatLayoutModel from '../database/seatLayout.model';
import { ISeatLayout } from '../../domain/interfaces/model/seatLayout.interface';
import SeatModel from '../database/seat.model';
import { ISeat } from '../../domain/interfaces/model/seat.interface';
import { ISeatLayoutRepository } from '../../domain/interfaces/repositories/seatLayout.repository';
import { SeatLayout, Seat } from '../../domain/entities/seatLayout.entity';
import { CustomError } from '../../utils/errors/custom.error';

@injectable()
export class SeatLayoutRepository implements ISeatLayoutRepository {
  private mapToEntity(seatLayout: ISeatLayout & { seatIds: any[] }): SeatLayout {
    return new SeatLayout(
      seatLayout._id,
      seatLayout.uuid,
      seatLayout.vendorId,
      seatLayout.layoutName,
      seatLayout.seatPrice,
      seatLayout.capacity,
      // Handle populated seats or ObjectId
      seatLayout.seatIds.map((seat) =>
        seat._id && seat.number ? this.mapSeatToEntity(seat) : seat,
      ),
      seatLayout.rowCount,
      seatLayout.columnCount,
      seatLayout.createdAt,
      seatLayout.updatedAt,
    );
  }

  private mapSeatToEntity(seat: ISeat): Seat {
    return new Seat(
      seat._id || null,
      seat.uuid,
      seat.seatLayoutId,
      seat.number,
      seat.type,
      seat.price,
      seat.position,
    );
  }

  async findByVendor(params: {
    vendorId: string;
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ seatLayouts: any[]; totalCount: number }> {
    try {
      const {
        vendorId,
        page = 1,
        limit = 10,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = params;

      const query: any = { vendorId: new mongoose.Types.ObjectId(vendorId) };
      if (search) {
        query.layoutName = { $regex: search, $options: 'i' };
      }

      const skip = (page - 1) * limit;
      const sort: { [key: string]: SortOrder } = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

      const [seatLayouts, totalCount] = await Promise.all([
        SeatLayoutModel.find(query).sort(sort).skip(skip).limit(limit).lean(),
        SeatLayoutModel.countDocuments(query),
      ]);

      return {
        seatLayouts: seatLayouts.map((doc) => this.mapToEntity(doc)),
        totalCount,
      };
    } catch (error) {
      console.error('❌ Error fetching seat layouts:', error);
      throw new CustomError('Failed to fetch seat layouts', 500);
    }
  }

  async create(seatLayout: SeatLayout): Promise<SeatLayout> {
    try {
      const {
        uuid,
        vendorId,
        layoutName,
        seatPrice,
        capacity,
        seatIds,
        rowCount,
        columnCount,
        createdAt,
        updatedAt,
      } = seatLayout;

      // Convert Seat[] to ObjectId[]
      const mappedSeatIds = Array.isArray(seatIds)
        ? seatIds
            .map((seat) => (seat instanceof Seat && seat._id ? seat._id : seat))
            .filter((id): id is mongoose.Types.ObjectId => id instanceof mongoose.Types.ObjectId)
        : [];

      const seatLayoutDoc = await SeatLayoutModel.findOneAndUpdate(
        { uuid },
        {
          $set: {
            vendorId,
            layoutName,
            seatPrice,
            capacity,
            seatIds: mappedSeatIds,
            rowCount,
            columnCount,
            createdAt,
            updatedAt,
          },
        },
        { upsert: true, new: true },
      );

      return this.mapToEntity(seatLayoutDoc);
    } catch (error) {
      console.error('🚖 Error creating seat layout:', error);
      throw new CustomError('Error creating seat layout', 500);
    }
  }

  async update(seatLayout: SeatLayout): Promise<SeatLayout> {
    try {
      // Convert Seat[] to ObjectId[]
      const seatIds = Array.isArray(seatLayout.seatIds)
        ? seatLayout.seatIds
            .map((seat) => (seat instanceof Seat && seat._id ? seat._id : seat))
            .filter((id): id is mongoose.Types.ObjectId => id instanceof mongoose.Types.ObjectId)
        : [];

      const seatLayoutDoc = await SeatLayoutModel.findByIdAndUpdate(
        seatLayout._id,
        {
          $set: {
            uuid: seatLayout.uuid,
            layoutName: seatLayout.layoutName,
            seatPrice: seatLayout.seatPrice,
            capacity: seatLayout.capacity,
            seatIds,
            rowCount: seatLayout.rowCount,
            columnCount: seatLayout.columnCount,
            updatedAt: new Date(),
          },
        },
        { new: true },
      );

      if (!seatLayoutDoc) {
        throw new CustomError('Seat layout not found', 404);
      }

      return this.mapToEntity(seatLayoutDoc);
    } catch (error) {
      console.error('🚖 Error updating seat layout:', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Error updating seat layout', 500);
    }
  }

  async createSeats(seats: Seat[]): Promise<Seat[]> {
    try {
      const uuids = seats.map((seat) => seat.uuid);
      const existingSeats = await SeatModel.find({ uuid: { $in: uuids } }).select('uuid');
      const existingUuids = new Set(existingSeats.map((seat) => seat.uuid));

      const newSeats = seats.filter((seat) => !existingUuids.has(seat.uuid));

      if (newSeats.length === 0) {
        throw new CustomError('All provided seat UUIDs already exist', 400);
      }

      if (newSeats.length < seats.length) {
        console.warn(`Skipped ${seats.length - newSeats.length} seats with duplicate UUIDs`);
      }

      const seatDocs = await SeatModel.insertMany(
        newSeats.map((seat) => ({
          uuid: seat.uuid,
          seatLayoutId: seat.seatLayoutId,
          number: seat.number,
          type: seat.type,
          price: seat.price,
          position: seat.position,
        })),
        { ordered: false },
      );

      return seatDocs.map((doc: any) => this.mapSeatToEntity(doc));
    } catch (error) {
      console.error('🚖 Error creating seats:', error);
      throw new CustomError('Error creating seats', 500);
    }
  }

  async replaceSeats(seatLayoutId: mongoose.Types.ObjectId, seats: Seat[]): Promise<Seat[]> {
    try {
      await SeatModel.deleteMany({ seatLayoutId });

      const seatDocs = await SeatModel.insertMany(
        seats.map((seat) => ({
          uuid: seat.uuid,
          seatLayoutId: seat.seatLayoutId,
          number: seat.number,
          type: seat.type,
          price: seat.price,
          position: seat.position,
        })),
        { ordered: false },
      );

      return seatDocs.map((doc: any) => this.mapSeatToEntity(doc));
    } catch (error) {
      console.error('🚖 Error replacing seats:', error);
      throw new CustomError('Error replacing seats', 500);
    }
  }

  async findById(id: string): Promise<SeatLayout | null> {
    try {
      // if (!mongoose.Types.ObjectId.isValid(id)) {
      //   throw new CustomError('Invalid seat layout ID', 400);
      // }

      const seatLayoutDoc = await SeatLayoutModel.findById(id)
        .populate({
          path: 'seatIds',
          model: 'Seat',
          select: 'uuid number type price position',
        })
        .lean();

      if (!seatLayoutDoc) {
        return null;
      }

      const mappedSeatLayout = {
        ...seatLayoutDoc,
        seatIds: seatLayoutDoc.seatIds.map((seat: any) => this.mapSeatToEntity(seat)),
      };

      return this.mapToEntity(mappedSeatLayout);
    } catch (error) {
      console.error('🚖 Error fetching seat layout by ID:', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Error fetching seat layout by ID', 500);
    }
  }
}
