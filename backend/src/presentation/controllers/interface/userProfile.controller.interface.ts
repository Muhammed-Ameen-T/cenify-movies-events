// src/presentation/controllers/auth.controller.interface.ts
import { Request, Response } from 'express';

export interface IUserProfileController {
  getCurrentUser(req: Request, res: Response): Promise<void>;
  updateUserProfile(req: Request, res: Response): Promise<void>;
  findUserWallet(req: Request, res: Response): Promise<void>;
  findProfileContents(req: Request, res: Response): Promise<void>;
  changePassword(req: Request, res: Response): Promise<void>;
  findUserWalletTransactions(req: Request, res: Response): Promise<void>;
  redeemLoyaltyPoints(req: Request, res: Response): Promise<void>;
}
