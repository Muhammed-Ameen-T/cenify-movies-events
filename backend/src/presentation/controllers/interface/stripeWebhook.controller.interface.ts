import { Request, Response } from 'express';

export interface IStripeWebhookController {
  handleWebhook(req: Request, res: Response): Promise<void>; // Added webhook handler
}
