import { SelectSeatDTO } from '../../../../application/dtos/seatSelection.dto';

export interface ISelectSeatsUseCase {
  execute(dto: SelectSeatDTO): Promise<{
    selectedSeats: { seatId: string; seatNumber: string; price: number; type: string }[];
  }>;
}
