// src/infrastructure/database/seatLayout.repository.ts
import { injectable } from 'tsyringe';
import mongoose from 'mongoose';
import SeatLayoutModel from '../database/seatLayout.model';
import { ISeatLayout } from '../../domain/interfaces/model/seatLayout.interface';
import SeatModel from '../database/seat.model';
import { ISeat } from '../../domain/interfaces/model/seat.interface';
import { ISeatLayoutRepository } from '../../domain/interfaces/repositories/seatLayout.repository';
import { SeatLayout, Seat } from '../../domain/entities/seatLayout.entity';
import { CustomError } from '../../utils/errors/custom.error';

@injectable()
export class SeatLayoutRepository implements ISeatLayoutRepository {
  private mapToEntity(seatLayout: ISeatLayout): SeatLayout {
    return new SeatLayout(
      seatLayout._id,
      seatLayout.uuid,
      seatLayout.vendorId,
      seatLayout.layoutName,
      seatLayout.seatPrice,
      seatLayout.capacity,
      seatLayout.seatIds,
      seatLayout.rowCount,
      seatLayout.columnCount,
      seatLayout.createdAt,
      seatLayout.updatedAt
    );
  }

  private mapSeatToEntity(seat: ISeat): Seat {
    return new Seat(
      seat._id,
      seat.uuid,
      seat.seatLayoutId,
      seat.number,
      seat.type,
      seat.price,
      seat.position
    );
  }

  async create(seatLayout: SeatLayout): Promise<SeatLayout> {
    try {
      const seatLayoutDoc = await SeatLayoutModel.findOneAndUpdate(
        { uuid: seatLayout.uuid }, // Find by uuid
        {
          $set: {
            vendorId: seatLayout.vendorId,
            layoutName: seatLayout.layoutName,
            seatPrice: seatLayout.seatPrice,
            capacity: seatLayout.capacity,
            seatIds: seatLayout.seatIds,
            rowCount: seatLayout.rowCount,
            columnCount: seatLayout.columnCount,
            createdAt: seatLayout.createdAt,
            updatedAt: seatLayout.updatedAt,
          },
        },
        { upsert: true, new: true } // Create if not exists, return updated document
      );
      return this.mapToEntity(seatLayoutDoc);
    } catch (error: any) {
      console.error("🚀 ~ SeatLayoutRepository ~ create ~ error:", error);
      throw new CustomError('Error creating or updating seat layout', 500);
    }
  }

  async createSeats(seats: Seat[]): Promise<Seat[]> {
    try {
      // Check for existing UUIDs
      const uuids = seats.map((seat) => seat.uuid);
      const existingSeats = await SeatModel.find({ uuid: { $in: uuids } }).select('uuid');
      const existingUuids = new Set(existingSeats.map((seat) => seat.uuid));

      // Filter out seats with duplicate UUIDs
      const newSeats = seats.filter((seat) => !existingUuids.has(seat.uuid));

      if (newSeats.length === 0) {
        throw new CustomError('All provided seat UUIDs already exist', 400);
      }

      if (newSeats.length < seats.length) {
        console.warn(`Skipped ${seats.length - newSeats.length} seats with duplicate UUIDs`);
      }

      // Insert only new seats
      const seatDocs = await SeatModel.insertMany(
        newSeats.map((seat) => ({
          uuid: seat.uuid,
          seatLayoutId: seat.seatLayoutId,
          number: seat.number,
          type: seat.type,
          price: seat.price,
          position: seat.position,
        })),
        { ordered: false } // Continue inserting non-duplicate seats even if some fail
      );

      return seatDocs.map((doc: any) => this.mapSeatToEntity(doc));
    } catch (error: any) {
      console.error("🚀 ~ SeatLayoutRepository ~ createSeats ~ error:", error);
      if (error.code === 11000) {
        throw new CustomError(`Duplicate UUID found for one or more seats`, 400);
      }
      throw new CustomError('Error creating seats', 500);
    }
  }
}