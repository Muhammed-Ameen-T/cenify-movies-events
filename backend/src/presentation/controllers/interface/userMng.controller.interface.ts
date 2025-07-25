import { NextFunction, Request, Response } from 'express';

export interface IUserManagementController {
  getUsers(req: Request, res: Response, next: NextFunction): Promise<void>;
  updateUserBlockStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
}
