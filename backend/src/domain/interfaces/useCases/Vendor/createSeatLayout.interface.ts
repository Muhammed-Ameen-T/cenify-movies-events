// src/domain/interfaces/useCases/Vendor/createSeatLayout.interface.ts
import { Response } from 'express';
import { CreateSeatLayoutDTO } from '../../../../application/dtos/seatLayout';

export interface ICreateSeatLayoutUseCase {
  execute(dto: CreateSeatLayoutDTO, res: Response): Promise<void>;
}
