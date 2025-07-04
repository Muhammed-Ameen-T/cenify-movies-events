import { injectable, inject } from 'tsyringe';
import { ITheaterRepository } from '../../../domain/interfaces/repositories/theater.repository';
import { IFetchTheatersUseCase } from '../../../domain/interfaces/useCases/Vendor/fetchTheaters.interface';
import { TheaterResponseDTO } from '../../dtos/vendor.dto';
import { Theater } from '../../../domain/entities/theater.entity';
import { IVendorSM } from '../../dtos/vendor.dto';

@injectable()
export class FetchTheatersUseCase implements IFetchTheatersUseCase {
  constructor(@inject('TheaterRepository') private theaterRepository: ITheaterRepository) {}

  async execute(): Promise<TheaterResponseDTO[]> {
    try {
      const theaters = await this.theaterRepository.findTheaters();
      return theaters.map((theater: Theater) => this.mapToDTO(theater));
    } catch (error) {
      console.error('Error fetching theaters:', error);
      throw new Error('Failed to retrieve theaters');
    }
  }

  private mapToDTO(theater: Theater): TheaterResponseDTO {
    const vendor = theater.vendorId as unknown as IVendorSM;

    return new TheaterResponseDTO(
      theater._id.toString(),
      theater.name,
      theater.status,
      theater.location,
      theater.facilities,
      theater.intervalTime,
      theater.gallery,
      theater.email,
      theater.phone,
      theater.rating,
      theater.ratingCount,
      theater.description,
      vendor
        ? {
            id: vendor._id.toString(),
            name: vendor.name,
            email: vendor.email,
            phone: vendor.phone,
          }
        : null,
      theater.createdAt,
      theater.updatedAt,
    );
  }
}
