import { Request, Response } from 'express';

export interface IScreenManagementController {
  createScreen(req: Request, res: Response): Promise<void>;
  updateScreen(req: Request, res: Response): Promise<void>;
  getScreensOfVendor(req: Request, res: Response): Promise<void>;
}