import { Request, Response } from 'express';

export interface IVendorAuthController {
  sendOtp(req: Request, res: Response): Promise<void>;
  verifyOtp(req: Request, res: Response): Promise<void>;
  login(req: Request, res: Response): Promise<void>;
  createNewTheater(req: Request, res: Response): Promise<void>;
  // refreshToken(req: Request, res: Response): Promise<void>;
  getCurrentUser(req: Request, res: Response): Promise<void>;
}
