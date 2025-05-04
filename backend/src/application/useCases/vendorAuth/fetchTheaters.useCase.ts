// src/application/useCases/Vendor/fetchTheaters.useCase.ts
import { injectable, inject } from 'tsyringe';
import { ITheaterRepository } from '../../../domain/interfaces/repositories/theater.repository';
import { IFetchTheatersUseCase } from '../../../domain/interfaces/useCases/Vendor/fetchTheaters.interface';
import { VendorResponseDTO } from '../../dtos/vendor.dto';
import { Theater } from '../../../domain/entities/theater.entity';

@injectable()
export class FetchTheatersUseCase implements IFetchTheatersUseCase {
  constructor(
    @inject('TheaterRepository') private vendorRepository: ITheaterRepository,
  ) {}

  async execute(): Promise<VendorResponseDTO[]> {
    const theaters = await this.vendorRepository.findTheaters();
    return theaters.map((theater: Theater) => this.mapToDTO(theater));
  }

  private mapToDTO(vendor: Theater): VendorResponseDTO {
    return new VendorResponseDTO(
      vendor._id,
      vendor.name,
      vendor.status,
      vendor.location,
      vendor.facilities,
      vendor.intervalTime,
      vendor.gallery,
      vendor.email,
      vendor.phone,
      vendor.rating,
      vendor.description  ,
      vendor.createdAt,
      vendor.updatedAt,
    );
  }
}