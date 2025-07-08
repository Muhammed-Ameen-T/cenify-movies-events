import { inject, injectable } from 'tsyringe';
import { Theater } from '../../../domain/entities/theater.entity';
import { ITheaterRepository } from '../../../domain/interfaces/repositories/theater.repository';
import { TheaterDetailsDTO } from '../../dtos/vendor.dto';
import { CustomError } from '../../../utils/errors/custom.error';
import { HttpResCode, HttpResMsg } from '../../../utils/constants/httpResponseCode.utils';
import ERROR_MESSAGES from '../../../utils/constants/commonErrorMsg.constants';
import { ICreateNewTheaterUseCase } from '../../../domain/interfaces/useCases/Vendor/createNewTheater.interface';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
@injectable()
export class CreateNewTheaterUseCase implements ICreateNewTheaterUseCase {
  constructor(@inject('TheaterRepository') private theaterRepository: ITheaterRepository) {}

  async execute(dto: TheaterDetailsDTO): Promise<Theater> {
    // Check for existing theater by email
    const existingTheater = await this.theaterRepository.findByEmail(dto.email);
    if (existingTheater) {
      throw new CustomError(ERROR_MESSAGES.VALIDATION.EMAIL_ALREADY_EXISTS, HttpResCode.CONFLICT);
    }
    dto.location.type = 'Point';

    const newTheater = new Theater(
      null as any,
      [],
      dto.name,
      'verifying',
      dto.location,
      dto.facilities,
      new Date(),
      new Date(),
      parseInt(dto.intervalTime),
      dto.gallery,
      dto.email,
      parseInt(dto.phone, 10),
      dto.description,
      new mongoose.Types.ObjectId(dto.vendorId),
      0,
      0,
    );

    try {
      const savedTheater = await this.theaterRepository.create(newTheater);
      return savedTheater;
    } catch (error) {
      throw new CustomError(HttpResMsg.INTERNAL_SERVER_ERROR, HttpResCode.INTERNAL_SERVER_ERROR);
    }
  }
}
