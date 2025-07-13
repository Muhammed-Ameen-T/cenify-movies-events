// src/application/useCases/User/fetchShowSelection.usecase.ts
import { inject, injectable } from 'tsyringe';
import { IFetchShowSelectionUseCase } from '../../../domain/interfaces/useCases/User/fetchShowSelection.interface';
import { CustomError } from '../../../utils/errors/custom.error';
import { HttpResCode } from '../../../utils/constants/httpResponseCode.utils';
import { IShowRepository } from '../../../domain/interfaces/repositories/show.repository';
import { ShowSelectionResponseDTO } from '../../dtos/show.dto';

@injectable()
export class FetchShowSelectionUseCase implements IFetchShowSelectionUseCase {
  constructor(@inject('ShowRepository') private showRepository: IShowRepository) {}

  async execute(params: {
    movieId: string;
    latitude: number;
    longitude: number;
    selectedLocation: string;
    date: string;
    priceRanges?: { min: number; max: number }[];
    timeSlots?: { start: string; end: string }[];
    facilities?: string[];
  }): Promise<ShowSelectionResponseDTO> {
    try {
      return await this.showRepository.findShowSelection(params);
    } catch (error) {
      console.error('❌ Error in FetchShowSelectionUseCase:', error);
      throw new CustomError(
        error instanceof CustomError ? error.message : 'Failed to fetch show selection',
        error instanceof CustomError ? error.statusCode : HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
