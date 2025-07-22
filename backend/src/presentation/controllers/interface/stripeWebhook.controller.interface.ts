import { NextFunction, Request, Response } from 'express';

export interface IStripeWebhookController {
  handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void>; // Added webhook handler
}
