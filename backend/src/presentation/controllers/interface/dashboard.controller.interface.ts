// src/interfaces/controllers/interface/dashboard.controller.interface.ts
import { Request, Response } from 'express';

export interface IDashboardController {
  getDashboardData(req: Request, res: Response): Promise<void>;
  getAdminDashboardData(req: Request, res: Response): Promise<void>;
}
