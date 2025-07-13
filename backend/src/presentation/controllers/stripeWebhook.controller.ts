import { NextFunction, Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import Stripe from 'stripe';
import { env } from '../../config/env.config';
import { sendResponse } from '../../utils/response/sendResponse.utils';
import { HttpResCode, HttpResMsg } from '../../utils/constants/httpResponseCode.utils';
import { CustomError } from '../../utils/errors/custom.error';
import { ICreateMoviePassUseCase } from '../../domain/interfaces/useCases/User/moviePass.interface';
import { IStripeWebhookController } from './interface/stripeWebhook.controller.interface';

@injectable()
export class StripeWebhookController implements IStripeWebhookController {
  private stripe: Stripe;

  constructor(
    @inject('CreateMoviePassUseCase') private createMoviePassUseCase: ICreateMoviePassUseCase,
  ) {
    this.stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2025-05-28.basil' });
  }

  async handleWebhook(req: Request, res: Response, next:NextFunction): Promise<void> {
    const sig = req.headers['stripe-signature'] as string;
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(req.body, sig, env.STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      sendResponse(res, HttpResCode.BAD_REQUEST, 'Webhook Error');
      return;
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;

      if (userId) {
        try {
          const purchaseDate = new Date();
          const expireDate = new Date(purchaseDate);
          expireDate.setDate(purchaseDate.getDate() + 30);

          await this.createMoviePassUseCase.execute({
            userId,
            purchaseDate,
            expireDate,
          });
          console.log(`✅ Movie Pass created for user ${userId}`);
        } catch (error) {
          console.error(`❌ Failed to create Movie Pass for user ${userId}:`, error);
        }
      }
    }
    sendResponse(res, HttpResCode.OK, 'Webhook received');
  }
}
