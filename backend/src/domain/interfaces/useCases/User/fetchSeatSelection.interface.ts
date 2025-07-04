import { SeatSelectionResponseDTO } from '../../../../application/dtos/seatSelection.dto';

export interface IFetchSeatSelectionUseCase {
  execute(showId: string): Promise<SeatSelectionResponseDTO>;
}
