// src/domain/useCases/FetchTheatersUseCase.ts
import { injectable, inject } from 'tsyringe';
import { ITheaterRepository } from '../../../domain/interfaces/repositories/theater.repository';
import { IFetchAdminTheatersUseCase } from '../../../domain/interfaces/useCases/Admin/fetchAdminTheaters.interface';
import { TheaterResponseDTO } from '../../dtos/vendor.dto';
import { Theater } from '../../../domain/entities/theater.entity';
import { FetchTheatersParams } from '../../../domain/types/theater';

@injectable()
export class FetchAdminTheatersUseCase implements IFetchAdminTheatersUseCase {
  constructor(@inject('TheaterRepository') private theaterRepository: ITheaterRepository) {}

  async execute(params: FetchTheatersParams = {}): Promise<{
    theaters: TheaterResponseDTO[];
    totalCount: number;
  }> {
    try {
      const { theaters, totalCount } = await this.theaterRepository.findAdminTheaters(params);
      return {
        theaters: theaters.map((theater: Theater) => this.mapToDTO(theater)),
        totalCount,
      };
    } catch (error) {
      console.error('Error fetching theaters:', error);
      throw new Error('Failed to retrieve theaters');
    }
  }

  private mapToDTO(theater: Theater): TheaterResponseDTO {
    const vendor = theater.vendorId as any;

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
