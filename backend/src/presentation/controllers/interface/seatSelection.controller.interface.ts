// src/interfaces/http/controllers/ISeatSelectionController.ts
import { NextFunction, Request, Response } from 'express';

export interface ISeatSelectionController {
  getSeatSelection(req: Request, res: Response, next: NextFunction): Promise<void>;
  selectSeats(req: Request, res: Response, next: NextFunction): Promise<void>;
}
