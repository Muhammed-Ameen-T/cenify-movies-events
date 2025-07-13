import { NextFunction, Request, Response } from 'express';

export interface IScreenManagementController {
  createScreen(req: Request, res: Response, next:NextFunction): Promise<void>;
  updateScreen(req: Request, res: Response, next:NextFunction): Promise<void>;
  getScreensOfVendor(req: Request, res: Response, next:NextFunction): Promise<void>;
}
