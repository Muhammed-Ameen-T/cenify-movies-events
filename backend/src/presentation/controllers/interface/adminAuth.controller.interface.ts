import { NextFunction, Request, Response } from 'express';
export interface IAdminAuthController {
  login(req: Request, res: Response, next: NextFunction): Promise<void>;
}
