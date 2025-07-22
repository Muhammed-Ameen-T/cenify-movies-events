import { NextFunction, Request, Response } from 'express';

export interface IMoviePassController {
  createMoviePass(req: Request, res: Response, next: NextFunction): Promise<void>;
  getMoviePass(req: Request, res: Response, next: NextFunction): Promise<void>;
  createCheckoutSession(req: Request, res: Response, next: NextFunction): Promise<void>;
  findMoviePassHistory(req: Request, res: Response, next: NextFunction): Promise<void>;
}
