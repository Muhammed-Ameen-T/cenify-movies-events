// src/application/useCases/Vendor/fetchTheaters.useCase.ts
import { injectable, inject } from 'tsyringe';
import { IVendorRepository } from '../../../domain/interfaces/repositories/vendor.repository';
import { IFetchTheatersUseCase } from '../../../domain/interfaces/useCases/Vendor/fetchTheaters.interface';
import { VendorResponseDTO } from '../../dtos/vendor.dto';
import { Vendor } from '../../../domain/entities/vendor.entity';

@injectable()
export class FetchTheatersUseCase implements IFetchTheatersUseCase {
  constructor(
    @inject('VendorRepository') private vendorRepository: IVendorRepository,
  ) {}

  async execute(): Promise<VendorResponseDTO[]> {
    const theaters = await this.vendorRepository.findTheaters();
    return theaters.map((theater: Vendor) => this.mapToDTO(theater));
  }

  private mapToDTO(vendor: Vendor): VendorResponseDTO {
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
      vendor.accountType,
      vendor.createdAt,
      vendor.updatedAt,
    );
  }
}