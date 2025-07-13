import { NextFunction, Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { sendResponse } from '../../utils/response/sendResponse.utils';
import { HttpResCode, HttpResMsg } from '../../utils/constants/httpResponseCode.utils';
import { CustomError } from '../../utils/errors/custom.error';
import { IMoviePassController } from '../controllers/interface/moviePass.controller.interface';
import {
  ICreateMoviePassUseCase,
  IFetchMoviePassUseCase,
} from '../../domain/interfaces/useCases/User/moviePass.interface';
import Stripe from 'stripe';
import { env } from '../../config/env.config';
import ERROR_MESSAGES from '../../utils/constants/commonErrorMsg.constants';
import { IFindMoviePassHistoryUseCase } from '../../domain/interfaces/useCases/User/findUserMoviePassHistory.interface';

@injectable()
export class MoviePassController implements IMoviePassController {
  private stripe: Stripe;

  constructor(
    @inject('CreateMoviePassUseCase') private createMoviePassUseCase: ICreateMoviePassUseCase,
    @inject('FetchMoviePassUseCase') private fetchMoviePassUseCase: IFetchMoviePassUseCase,
    @inject('FindMoviePassHistoryUseCase')
    private findMoviePassHistoryUseCase: IFindMoviePassHistoryUseCase,
  ) {
    this.stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2025-05-28.basil' });
  }

  async createCheckoutSession(req: Request, res: Response, next:NextFunction): Promise<void> {
    const userId = req.decoded?.userId;
    if (!userId) {
      throw new CustomError(HttpResMsg.UNAUTHORIZED, HttpResCode.UNAUTHORIZED);
    }

    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'inr',
              product_data: {
                name: 'Movie Pass',
                description: '30-day Movie Pass subscription',
              },
              unit_amount: 19900, // ₹199 in paise
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `http://localhost:5173/account/moviepass-tab?payment=success`,
        cancel_url: `http://localhost:5173/account/moviepass-tab?payment=canceled`,
        metadata: { userId },
      });

      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, { sessionId: session.id });
    } catch (error) {
next(error)    }
  }

  async createMoviePass(req: Request, res: Response, next:NextFunction): Promise<void> {
    const userId = req.body.userId;
    if (!userId) {
      throw new CustomError(HttpResMsg.UNAUTHORIZED, HttpResCode.UNAUTHORIZED);
    }

    try {
      const purchaseDate = new Date();
      const expireDate = new Date(purchaseDate);
      expireDate.setDate(purchaseDate.getDate() + 30);

      const moviePass = await this.createMoviePassUseCase.execute({
        userId,
        purchaseDate,
        expireDate,
      });

      sendResponse(res, HttpResCode.CREATED, HttpResMsg.SUCCESS, moviePass);
    } catch (error) {
next(error)    }
  }

  async getMoviePass(req: Request, res: Response, next:NextFunction): Promise<void> {
    const userId = req.decoded?.userId;
    if (!userId) {
      throw new CustomError(HttpResMsg.UNAUTHORIZED, HttpResCode.UNAUTHORIZED);
    }

    try {
      const moviePass = await this.fetchMoviePassUseCase.execute(userId);
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, moviePass || {});
    } catch (error) {
next(error)    }
  }

  async findMoviePassHistory(req: Request, res: Response, next:NextFunction): Promise<void> {
    const userId = req.decoded?.userId;
    if (!userId) {
      throw new CustomError(HttpResMsg.UNAUTHORIZED, HttpResCode.UNAUTHORIZED);
    }

    const { page = '1', limit = '5' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    if (isNaN(pageNum) || pageNum < 1 || isNaN(limitNum) || limitNum < 1) {
      throw new CustomError(
        ERROR_MESSAGES.VALIDATION.INVALID_PAGINATION_PARAMS,
        HttpResCode.BAD_REQUEST,
      );
    }

    try {
      const result = await this.findMoviePassHistoryUseCase.execute(userId, pageNum, limitNum);
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, result);
    } catch (error) {
      next(error)
    }
  }
}
