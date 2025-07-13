// src/interfaces/controllers/interface/dashboard.controller.interface.ts
import { NextFunction, Request, Response } from 'express';

export interface IDashboardController {
  getDashboardData(req: Request, res: Response, next:NextFunction): Promise<void>;
  getAdminDashboardData(req: Request, res: Response, next:NextFunction): Promise<void>;
}
