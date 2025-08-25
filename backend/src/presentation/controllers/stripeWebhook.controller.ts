import { NextFunction, Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import Stripe from 'stripe';
import { env } from '../../config/env.config';
import { sendResponse } from '../../utils/response/sendResponse.utils';
import { HttpResCode, HttpResMsg } from '../../utils/constants/httpResponseCode.utils';
import { CustomError } from '../../utils/errors/custom.error';
import { ICreateMoviePassUseCase } from '../../domain/interfaces/useCases/User/moviePass.interface';
import { IStripeWebhookController } from './interface/stripeWebhook.controller.interface';

/**
 * Controller for handling Stripe webhook events, specifically for processing `checkout.session.completed` events
 * to create a Movie Pass for the user.
 * @implements {IStripeWebhookController}
 */
@injectable()
export class StripeWebhookController implements IStripeWebhookController {
  private stripe: Stripe;

  /**
   * Constructs an instance of StripeWebhookController.
   * @param {ICreateMoviePassUseCase} createMoviePassUseCase - The use case for creating a movie pass.
   */
  constructor(
    @inject('CreateMoviePassUseCase') private createMoviePassUseCase: ICreateMoviePassUseCase,
  ) {
    this.stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2025-05-28.basil' });
  }

  /**
   * Handles incoming Stripe webhook events.
   * Verifies the webhook signature and processes `checkout.session.completed` events
   * to create a movie pass for the associated user.
   * @param {Request} req - The Express request object containing the Stripe event.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function (not used directly for sending response in this case, but good for error propagation if needed).
   * @returns {Promise<void>}
   */
  async handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    const sig = req.headers['stripe-signature'] as string;
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(req.body, sig, env.STRIPE_WEBHOOK_SECRET_MOVIE_PASS);
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
