import { Response } from 'express';
import { SeatLayout } from '../../../entities/seatLayout.entity';
export interface IFindSeatLayoutByIdUseCase {
  execute(seatLayoutId: string, res: Response): Promise<SeatLayout | null>;
}
