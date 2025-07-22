import { NextFunction, Request, Response } from 'express';
export interface IVendorAuthController {
  sendOtp(req: Request, res: Response, next: NextFunction): Promise<void>;
  verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void>;
  login(req: Request, res: Response, next: NextFunction): Promise<void>;
  createNewTheater(req: Request, res: Response, next: NextFunction): Promise<void>;
  // refreshToken(req: Request, res: Response, next:NextFunction): Promise<void>;
  // getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void>;
}
