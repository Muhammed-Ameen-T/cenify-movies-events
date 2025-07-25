import { NextFunction, Request, Response } from 'express';
import { SeatLayout } from '../../../domain/entities/seatLayout.entity';

export interface ISeatLayoutController {
  createSeatLayout(req: Request, res: Response, next: NextFunction): Promise<void>;
  findSeatLayoutsByVendor(req: Request, res: Response, next: NextFunction): Promise<void>;
  updateSeatLayout(req: Request, res: Response, next: NextFunction): Promise<void>;
  findSeatLayoutById(req: Request, res: Response, next: NextFunction): Promise<void>;
}
