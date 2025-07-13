// src/presentation/controllers/notificationMng/interface/notificationMng.controller.interface.ts
import { NextFunction, Request, Response } from 'express';

export interface INotificationMngController {
  createGlobalNotification(req: Request, res: Response, next:NextFunction): Promise<void>;
  createUserNotification(req: Request, res: Response, next:NextFunction): Promise<void>;
  readOneNotification(req: Request, res: Response, next:NextFunction): Promise<void>;
  readAllNotification(req: Request, res: Response, next:NextFunction): Promise<void>;
  readAllAdminNotification(req: Request, res: Response, next:NextFunction): Promise<void>;
  fetchAllUserNotification(req: Request, res: Response, next:NextFunction): Promise<void>;
  fetchAllAdminNotification(req: Request, res: Response, next:NextFunction): Promise<void>;
  createVendorNotification(req: Request, res: Response, next:NextFunction): Promise<void>;
}
