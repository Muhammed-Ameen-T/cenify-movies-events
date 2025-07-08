// src/domain/interfaces/useCases/User/fetchShowSelection.interface.ts
import { ShowSelectionResponseDTO } from '../../../../application/dtos/show.dto';

export interface IFetchShowSelectionUseCase {
  execute(params: {
    movieId: string;
    latitude: number;
    longitude: number;
    selectedLocation: string;
    date: string;
    priceRanges?: { min: number; max: number }[];
    timeSlots?: { start: string; end: string }[];
    facilities?: string[];
  }): Promise<ShowSelectionResponseDTO>;
}
