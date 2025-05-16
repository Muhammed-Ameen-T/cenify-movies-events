import { Request, Response } from 'express';

export interface ISeatLayoutController {
  createSeatLayout(req: Request, res: Response): Promise<void>;
}