import { Request, Response } from 'express';

export interface IMoviePassController {
  createMoviePass(req: Request, res: Response): Promise<void>;
  getMoviePass(req: Request, res: Response): Promise<void>;
  createCheckoutSession(req: Request, res: Response): Promise<void>;
  findMoviePassHistory(req: Request, res: Response): Promise<void>;
}
