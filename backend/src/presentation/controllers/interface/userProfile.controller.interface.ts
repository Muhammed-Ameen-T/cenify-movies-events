// src/presentation/controllers/auth.controller.interface.ts
import { NextFunction, Request, Response } from 'express';

export interface IUserProfileController {
  getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void>;
  updateUserProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
  findUserWallet(req: Request, res: Response, next: NextFunction): Promise<void>;
  findProfileContents(req: Request, res: Response, next: NextFunction): Promise<void>;
  changePassword(req: Request, res: Response, next: NextFunction): Promise<void>;
  findUserWalletTransactions(req: Request, res: Response, next: NextFunction): Promise<void>;
  redeemLoyaltyPoints(req: Request, res: Response, next: NextFunction): Promise<void>;
  sendOtpPhone(req: Request, res: Response, next: NextFunction): Promise<void>;
  verifyOtpPhone(req: Request, res: Response, next: NextFunction): Promise<void>;
  withdrawFromWallet(req: Request, res: Response, next: NextFunction): Promise<void>;
}
