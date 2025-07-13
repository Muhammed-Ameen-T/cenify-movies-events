// src/application/useCases/Vendor/createSeatLayout.useCase.ts
import { inject, injectable } from 'tsyringe';
import { Response } from 'express';
import mongoose from 'mongoose';
import { ISeatLayoutRepository } from '../../../domain/interfaces/repositories/seatLayout.repository';
import { ICreateSeatLayoutUseCase } from '../../../domain/interfaces/useCases/Vendor/createSeatLayout.interface';
import { sendResponse } from '../../../utils/response/sendResponse.utils';
import { HttpResCode, HttpResMsg } from '../../../utils/constants/httpResponseCode.utils';
import { CustomError } from '../../../utils/errors/custom.error';
import { SuccessMsg } from '../../../utils/constants/commonSuccessMsg.constants';
import ERROR_MESSAGES from '../../../utils/constants/commonErrorMsg.constants';
import { z } from 'zod';
import { Seat, SeatLayout } from '../../../domain/entities/seatLayout.entity';
import {
  CreateSeatLayoutDTO,
  CreateSeatLayoutDTOSchema,
  CreateSeatLayoutDTOType,
} from '../../dtos/seatLayout';
import SeatLayoutModel from '../../../infrastructure/database/seatLayout.model';

// Utility function to normalize seat types
const normalizeSeatType = (type: string): 'Regular' | 'Premium' | 'VIP' | 'Unavailable' => {
  const normalized = type.toLowerCase();
  switch (normalized) {
    case 'regular':
      return 'Regular';
    case 'premium':
      return 'Premium';
    case 'vip':
      return 'VIP';
    case 'unavailable':
      return 'Unavailable';
    default:
      throw new CustomError(`Invalid seat type: ${type}`, 400);
  }
};

@injectable()
export class CreateSeatLayoutUseCase implements ICreateSeatLayoutUseCase {
  constructor(
    @inject('SeatLayoutRepository') private seatLayoutRepository: ISeatLayoutRepository,
  ) {}

  async execute(dto: CreateSeatLayoutDTO, res: Response): Promise<void> {
    try {
      const normalizedDto = {
        ...dto,
        seats: dto.seats.map((seat) => ({
          ...seat,
          type: normalizeSeatType(seat.type),
        })),
      };

      const validatedData: CreateSeatLayoutDTOType = CreateSeatLayoutDTOSchema.parse(normalizedDto);

      if (!mongoose.Types.ObjectId.isValid(validatedData.vendorId)) {
        sendResponse(res, HttpResCode.BAD_REQUEST, ERROR_MESSAGES.VALIDATION.INVALID_VENDOR_ID);
        return;
      }

      const capacity = validatedData.seats.filter((seat) => seat.type !== 'Unavailable').length;
      if (capacity !== validatedData.capacity) {
        throw new CustomError(
          `Capacity mismatch: expected ${capacity}, got ${validatedData.capacity}`,
          400,
        );
      }

      // Validate seat count
      if (validatedData.seats.length !== validatedData.rowCount * validatedData.columnCount) {
        throw new CustomError(
          `Seat count mismatch: expected ${validatedData.rowCount * validatedData.columnCount}, got ${validatedData.seats.length}`,
          400,
        );
      }

      // Create SeatLayout entity
      const seatLayout = new SeatLayout(
        null,
        validatedData.uuid,
        new mongoose.Types.ObjectId(validatedData.vendorId),
        validatedData.layoutName,
        validatedData.seatPrice,
        capacity,
        [],
        validatedData.rowCount,
        validatedData.columnCount,
        new Date(),
        new Date(),
      );

      // Create or update SeatLayout document
      const savedSeatLayout = await this.seatLayoutRepository.create(seatLayout);
      if (!savedSeatLayout._id) {
        throw new CustomError('Failed to create or update seat layout', 500);
      }

      // Map seats with correct seatLayoutId
      const seats = validatedData.seats.map((seat) => {
        const normalizedType = seat.type.toLowerCase() as
          | 'regular'
          | 'premium'
          | 'vip'
          | 'unavailable';
        const type = seat.type as 'Regular' | 'Premium' | 'VIP' | 'Unavailable';
        const price =
          normalizedType === 'unavailable'
            ? 0
            : validatedData.seatPrice[normalizedType as 'regular' | 'premium' | 'vip'];
        if (price === undefined) {
          throw new CustomError(`Invalid price for seat type: ${seat.type}`, 400);
        }

        return new Seat(null, seat.uuid, savedSeatLayout._id!, seat.number, type, price, {
          row: seat.position.row,
          col: seat.position.col,
        });
      });

      // Create Seat documents
      const savedSeats = await this.seatLayoutRepository.createSeats(seats);
      seatLayout.seatIds = savedSeats.map((seat) => seat._id!);

      // Update SeatLayout with seatIds
      await SeatLayoutModel.updateOne(
        { _id: savedSeatLayout._id },
        { seatIds: seatLayout.seatIds },
      );

      // Prepare response
      const responseData = {
        _id: savedSeatLayout._id,
        uuid: savedSeatLayout.uuid,
        vendorId: savedSeatLayout.vendorId,
        layoutName: savedSeatLayout.layoutName,
        seatPrice: savedSeatLayout.seatPrice,
        capacity: savedSeatLayout.capacity,
        seatIds: savedSeatLayout.seatIds,
        rowCount: savedSeatLayout.rowCount,
        columnCount: savedSeatLayout.columnCount,
        createdAt: savedSeatLayout.createdAt,
        updatedAt: savedSeatLayout.updatedAt,
        createdSeats: savedSeats.length,
        skippedSeats: validatedData.seats.length - savedSeats.length,
      };

      sendResponse(res, HttpResCode.OK, SuccessMsg.SEAT_LAYOUT_CREATED, responseData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        sendResponse(res, HttpResCode.BAD_REQUEST, error.errors.map((e) => e.message).join(', '));
        return;
      }
      const errorMessage =
        error instanceof CustomError ? error.message : 'Failed to create seat layout';
      sendResponse(
        res,
        error instanceof CustomError ? error.statusCode : HttpResCode.INTERNAL_SERVER_ERROR,
        errorMessage,
      );
    }
  }
}
