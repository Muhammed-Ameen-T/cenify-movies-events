// src/application/useCases/Vendor/updateTheater.useCase.ts
import { inject, injectable } from 'tsyringe';
import { Response } from 'express';
import { ITheaterRepository } from '../../../domain/interfaces/repositories/theater.repository';
import { IUpdateTheaterUseCase } from '../../../domain/interfaces/useCases/Vendor/updateTheater.interfase';
import { TheaterResponseDTO } from '../../dtos/vendor.dto';
import { sendResponse } from '../../../utils/response/sendResponse.utils';
import { HttpResCode, HttpResMsg } from '../../../utils/constants/httpResponseCode.utils';
import { CustomError } from '../../../utils/errors/custom.error';
import ERROR_MESSAGES from '../../../utils/constants/commonErrorMsg.constants';
import { SuccessMsg } from '../../../utils/constants/commonSuccessMsg.constants';
import { Theater } from '../../../domain/entities/theater.entity';

@injectable()
export class UpdateTheaterUseCase implements IUpdateTheaterUseCase {
  constructor(@inject('TheaterRepository') private theaterRepository: ITheaterRepository) {}

  async execute(id: string, data: Partial<Theater>, res: Response): Promise<void> {
    try {
      const theater = await this.theaterRepository.findById(id);
      if (!theater) {
        sendResponse(res, HttpResCode.NOT_FOUND, HttpResMsg.THEATER_NOT_FOUND);
        return;
      }

      // Update theater fields
      const updatedTheater = new Theater(
        theater._id,
        theater.screens,
        data.name || theater.name,
        theater.status,
        theater.location,
        data.facilities || null,
        theater.createdAt,
        new Date(),
        data.intervalTime || theater.intervalTime,
        data.gallery || theater.gallery,
        data.email || theater.email,
        data.phone || theater.phone,
        data.description || theater.description,
        theater.vendorId,
        theater.rating,
        theater.ratingCount,
      );

      // Persist updates
      const savedTheater = await this.theaterRepository.updateTheaterDetails(updatedTheater);

      // Prepare response DTO
      const responseDTO = new TheaterResponseDTO(
        savedTheater._id.toString(),
        savedTheater.name,
        savedTheater.status,
        savedTheater.location,
        savedTheater.facilities,
        savedTheater.intervalTime,
        savedTheater.gallery,
        savedTheater.email,
        savedTheater.phone,
        savedTheater.rating,
        savedTheater.ratingCount,
        savedTheater.description,
        null,
        savedTheater.createdAt,
        savedTheater.updatedAt,
      );

      sendResponse(res, HttpResCode.OK, SuccessMsg.THEATER_UPDATED, responseDTO);
    } catch (error) {
      const errorMessage =
        error instanceof CustomError
          ? error.message
          : ERROR_MESSAGES.GENERAL.FAILED_UPDATING_THEATER;
      sendResponse(res, HttpResCode.INTERNAL_SERVER_ERROR, errorMessage);
    }
  }
}
