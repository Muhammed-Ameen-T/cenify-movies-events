import { NextFunction, Request, Response } from 'express';

export interface ITheaterManagementController {
  getTheaters(req: Request, res: Response, next:NextFunction): Promise<void>;
  updateTheaterStatus(req: Request, res: Response, next:NextFunction): Promise<void>;
  updateTheater(req: Request, res: Response, next:NextFunction): Promise<void>;
  getTheatersOfVendor(req: Request, res: Response, next:NextFunction): Promise<void>;
  fetchTheatersByAdmin(req: Request, res: Response, next:NextFunction): Promise<void>;
}
