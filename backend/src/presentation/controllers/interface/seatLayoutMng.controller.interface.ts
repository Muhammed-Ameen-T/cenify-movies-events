import { Request, Response } from 'express';
import { SeatLayout } from '../../../domain/entities/seatLayout.entity';

export interface ISeatLayoutController {
  createSeatLayout(req: Request, res: Response): Promise<void>;
  findSeatLayoutsByVendor(req: Request, res: Response): Promise<void>;
}