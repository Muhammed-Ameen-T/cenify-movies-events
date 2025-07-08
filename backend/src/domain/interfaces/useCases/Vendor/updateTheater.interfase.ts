// src/domain/interfaces/useCases/Vendor/updateTheater.interface.ts
import { Response } from 'express';
import { Theater } from '../../../entities/theater.entity';

export interface IUpdateTheaterUseCase {
  execute(id: string, data: Partial<Theater>, res: Response): Promise<void>;
}
