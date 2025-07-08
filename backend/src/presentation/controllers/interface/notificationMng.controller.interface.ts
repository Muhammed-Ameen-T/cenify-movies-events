// src/presentation/controllers/notificationMng/interface/notificationMng.controller.interface.ts
import { Request, Response } from 'express';

export interface INotificationMngController {
  createGlobalNotification(req: Request, res: Response): Promise<void>;
  createUserNotification(req: Request, res: Response): Promise<void>;
  readOneNotification(req: Request, res: Response): Promise<void>;
  readAllNotification(req: Request, res: Response): Promise<void>;
  readAllAdminNotification(req: Request, res: Response): Promise<void>;
  fetchAllUserNotification(req: Request, res: Response): Promise<void>;
  fetchAllAdminNotification(req: Request, res: Response): Promise<void>;
  createVendorNotification(req: Request, res: Response): Promise<void>;
}
