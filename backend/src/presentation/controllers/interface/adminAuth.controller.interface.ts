import { Request, Response } from 'express';

export interface IAdminAuthController {
  login(req: Request, res: Response): Promise<void>;
}
