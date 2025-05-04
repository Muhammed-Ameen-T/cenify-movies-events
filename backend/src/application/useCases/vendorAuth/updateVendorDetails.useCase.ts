import { inject, injectable } from 'tsyringe';
import { Theater } from '../../../domain/entities/theater.entity';
import { ITheaterRepository } from '../../../domain/interfaces/repositories/theater.repository';
import { UpdateTheaterDetailsDTO } from '../../dtos/vendor.dto';
import { CustomError } from '../../../utils/errors/custom.error';
import { HttpResCode, HttpResMsg } from '../../../utils/constants/httpResponseCode.utils';
import ERROR_MESSAGES from '../../../utils/constants/commonErrorMsg.constants';
import { IUpdateVendorDetailsUseCase } from '../../../domain/interfaces/useCases/Vendor/updateVendorDetails.interface';

@injectable()
export class UpdateVendorDetailsUseCase implements IUpdateVendorDetailsUseCase {
  constructor(@inject('TheaterRepository') private vendorRepository: ITheaterRepository) {}

  async execute(dto: UpdateTheaterDetailsDTO): Promise<Theater> {
    const existingTheater = await this.vendorRepository.findById(dto._id);
    if (!existingTheater) {
      throw new CustomError(ERROR_MESSAGES.DATABASE.RESOURCE_NOT_FOUND, HttpResCode.NOT_FOUND);
    }

    const updatedTheater = new Theater(
      existingTheater._id,
      existingTheater.screens,
      existingTheater.name,
      'verifying',
      dto.location || existingTheater.location,
      dto.facilities || existingTheater.facilities,
      existingTheater.createdAt,
      new Date(),
      dto.intervalTime ? parseInt(dto.intervalTime) : existingTheater.intervalTime,
      dto.gallery || existingTheater.gallery,
      existingTheater.email,
      existingTheater.phone,
      existingTheater.description,
      existingTheater.rating,
    );

    try {
      const savedTheater = await this.vendorRepository.updateTheaterDetails(updatedTheater);
      return savedTheater;
    } catch (error) {
      throw new CustomError(HttpResMsg.INTERNAL_SERVER_ERROR, HttpResCode.INTERNAL_SERVER_ERROR);
    }
  }
}
