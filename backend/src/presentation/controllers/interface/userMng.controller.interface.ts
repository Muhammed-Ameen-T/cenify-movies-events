import { Request, Response } from 'express';

export interface IUserManagementController {
  getUsers(req: Request, res: Response): Promise<void>;
  updateUserBlockStatus(req: Request, res: Response): Promise<void>;
}