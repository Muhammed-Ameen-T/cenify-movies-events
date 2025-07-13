// src/application/useCases/Vendor/findSeatLayoutById.useCase.ts
import { inject, injectable } from 'tsyringe';
import { Response } from 'express';
import { ISeatLayoutRepository } from '../../../domain/interfaces/repositories/seatLayout.repository';
import { IFindSeatLayoutByIdUseCase } from '../../../domain/interfaces/useCases/Vendor/findSeatLayoutById.interface';
import { sendResponse } from '../../../utils/response/sendResponse.utils';
import { HttpResCode, HttpResMsg } from '../../../utils/constants/httpResponseCode.utils';
import { CustomError } from '../../../utils/errors/custom.error';
import { SuccessMsg } from '../../../utils/constants/commonSuccessMsg.constants';
import ERROR_MESSAGES from '../../../utils/constants/commonErrorMsg.constants';
import { Seat, SeatLayout } from '../../../domain/entities/seatLayout.entity';

@injectable()
export class FindSeatLayoutByIdUseCase implements IFindSeatLayoutByIdUseCase {
  constructor(
    @inject('SeatLayoutRepository') private seatLayoutRepository: ISeatLayoutRepository,
  ) {}

  async execute(id: string, res: Response): Promise<SeatLayout | null> {
    try {
      const seatLayout = await this.seatLayoutRepository.findById(id);

      if (!seatLayout) {
        throw new CustomError(ERROR_MESSAGES.DATABASE.SEAT_LAYOUT_NOT_FOUND, 404);
      }

      return seatLayout;
    } catch (error) {
      const errorMessage =
        error instanceof CustomError ? error.message : 'Failed to fetch seat layout';
      throw new CustomError(errorMessage, error instanceof CustomError ? error.statusCode : 500);
    }
  }
}
