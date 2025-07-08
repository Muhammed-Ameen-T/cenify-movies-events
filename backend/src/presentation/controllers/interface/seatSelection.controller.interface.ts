// src/interfaces/http/controllers/ISeatSelectionController.ts
import { Request, Response } from 'express';

export interface ISeatSelectionController {
  getSeatSelection(req: Request, res: Response): Promise<void>;
  selectSeats(req: Request, res: Response): Promise<void>;
}
