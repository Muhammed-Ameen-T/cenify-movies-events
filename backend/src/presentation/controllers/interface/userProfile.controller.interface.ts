// src/presentation/controllers/auth.controller.interface.ts
import { Request, Response } from 'express';

export interface IUserProfileController {
  getCurrentUser(req: Request, res: Response): Promise<void>;
  updateUserProfile(req: Request, res: Response): Promise<void>;
}