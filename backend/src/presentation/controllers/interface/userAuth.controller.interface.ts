import { NextFunction, Request, Response } from 'express';

export interface IUserAuthController {
  googleCallback(req: Request, res: Response, next:NextFunction): Promise<void>;
  refreshToken(req: Request, res: Response, next:NextFunction): Promise<void>;
  getCurrentUser(req: Request, res: Response, next:NextFunction): Promise<void>;
  sendOtp(req: Request, res: Response, next:NextFunction): Promise<void>;
  verifyOtp(req: Request, res: Response, next:NextFunction): Promise<void>;
  login(req: Request, res: Response, next:NextFunction): Promise<void>;
  logout(req: Request, res: Response, next:NextFunction): Promise<void>;
  forgotPassSendOtp(req: Request, res: Response, next:NextFunction): Promise<void>;
  forgotPassVerifyOtp(req: Request, res: Response, next:NextFunction): Promise<void>;
  forgotPassUpdatePassword(req: Request, res: Response, next:NextFunction): Promise<void>;
}
