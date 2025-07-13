// src/domain/interfaces/useCases/Vendor/updateSeatLayout.interface.ts
import { Response } from 'express';
import { UpdateSeatLayoutDTO } from '../../../../application/dtos/seatLayout';
import { SeatLayout } from '../../../entities/seatLayout.entity';

export interface IUpdateSeatLayoutUseCase {
  execute(dto: UpdateSeatLayoutDTO, res: Response): Promise<SeatLayout | null>;
}
