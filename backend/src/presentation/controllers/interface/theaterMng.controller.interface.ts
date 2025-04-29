import { Request, Response } from "express";

export interface ITheaterManagementController {
  getTheaters(req: Request, res: Response): Promise<void>;
  updateTheaterStatus(req: Request, res: Response): Promise<void>;
}
