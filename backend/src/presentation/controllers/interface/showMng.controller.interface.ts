import { NextFunction, Request, Response } from 'express';

export interface IShowManagementController {
  createShow(req: Request, res: Response, next: NextFunction): Promise<void>;
  updateShow(req: Request, res: Response, next: NextFunction): Promise<void>;
  updateShowStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
  deleteShow(req: Request, res: Response, next: NextFunction): Promise<void>;
  getShowById(req: Request, res: Response, next: NextFunction): Promise<void>;
  getAllShows(req: Request, res: Response, next: NextFunction): Promise<void>;
  getShowsOfVendor(req: Request, res: Response, next: NextFunction): Promise<void>;
  getShowSelection(req: Request, res: Response, next: NextFunction): Promise<void>;
  createRecurringShow(req: Request, res: Response, next: NextFunction): Promise<void>;
}
