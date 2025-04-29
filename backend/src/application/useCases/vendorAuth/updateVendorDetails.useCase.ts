import { inject, injectable } from 'tsyringe';
import { Vendor } from '../../../domain/entities/vendor.entity';
import { IVendorRepository } from '../../../domain/interfaces/repositories/vendor.repository';
import { UpdateTheaterDetailsDTO } from '../../dtos/vendor.dto';
import { CustomError } from '../../../utils/errors/custome.error';
import { HttpResCode, HttpResMsg } from '../../../utils/constants/httpResponseCode.utils';
import ERROR_MESSAGES from '../../../utils/constants/commonErrorMsg.constants';
import { IUpdateVendorDetailsUseCase } from '../../../domain/interfaces/useCases/Vendor/updateVendorDetails.interface';

@injectable()
export class UpdateVendorDetailsUseCase implements IUpdateVendorDetailsUseCase {
  constructor(@inject('VendorRepository') private vendorRepository: IVendorRepository) {}

  async execute(dto: UpdateTheaterDetailsDTO): Promise<Vendor> {
    const existingTheater = await this.vendorRepository.findById(dto._id);
    if (!existingTheater) {
      throw new CustomError(ERROR_MESSAGES.DATABASE.RESOURCE_NOT_FOUND, HttpResCode.NOT_FOUND);
    }

    const updatedTheater = new Vendor(
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
      existingTheater.password,
      existingTheater.rating,
      existingTheater.accountType,
    );

    try {
      const savedTheater = await this.vendorRepository.updateVendorDetails(updatedTheater);
      return savedTheater;
    } catch (error) {
      throw new CustomError(HttpResMsg.INTERNAL_SERVER_ERROR, HttpResCode.INTERNAL_SERVER_ERROR);
    }
  }
}
