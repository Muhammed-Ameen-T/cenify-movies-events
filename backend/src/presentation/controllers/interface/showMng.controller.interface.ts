import { Request, Response } from 'express';

export interface IShowManagementController {
  createShow(req: Request, res: Response): Promise<void>;
  updateShow(req: Request, res: Response): Promise<void>;
  updateShowStatus(req: Request, res: Response): Promise<void>;
  deleteShow(req: Request, res: Response): Promise<void>;
  getShowById(req: Request, res: Response): Promise<void>;
  getAllShows(req: Request, res: Response): Promise<void>;
  getShowsOfVendor(req: Request, res: Response): Promise<void>;
  getShowSelection(req: Request, res: Response): Promise<void>;
  createRecurringShow(req: Request, res: Response): Promise<void>;
}
