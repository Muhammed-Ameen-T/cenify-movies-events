import { injectable, inject } from 'tsyringe';
import Stripe from 'stripe';
import { env } from '../../config/env.config';
import { IUserRepository } from '../../domain/interfaces/repositories/user.repository';
import { CustomError } from '../../utils/errors/custom.error';
import { HttpResCode } from '../../utils/constants/httpResponseCode.utils';
import mongoose from 'mongoose';
import { IWalletRepository } from '../../domain/interfaces/repositories/wallet.repository';
import ERROR_MESSAGES from '../../utils/constants/commonErrorMsg.constants';

@injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor(@inject('WalletRepository') private walletRepository: IWalletRepository) {
    this.stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2025-05-28.basil' });
  }

  async checkWalletBalance(userId: string, amount: number): Promise<boolean> {
    const wallet = await this.walletRepository.findByUserId(userId);
    if (!wallet) {
      return false;
    }
    return (wallet.balance || 0) >= amount;
  }

  async deductWalletBalance(userId: string, amount: number): Promise<void> {
    const wallet = await this.walletRepository.findByUserId(userId);
    if (!wallet) {
      throw new CustomError(ERROR_MESSAGES.GENERAL.WALLET_NOT_FOUND, HttpResCode.BAD_REQUEST);
    }
    if ((wallet.balance || 0) < amount) {
      throw new CustomError(ERROR_MESSAGES.GENERAL.INSUFFICIENT_BALANCE, HttpResCode.BAD_REQUEST);
    }
    await this.walletRepository.pushTransactionAndUpdateBalance(userId, {
      amount: amount,
      remark: 'Booking Payment Debited from Wallet',
      type: 'debit',
      source: 'booking',
      createdAt: new Date(),
    });
  }

  async createStripeSession(
    userId: string,
    bookingId: string,
    amount: number,
    showId: string,
    seats: string[],
  ): Promise<string> {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: 'Movie Ticket Booking',
              metadata: { bookingId, showId },
            },
            unit_amount: amount * 100, // Stripe expects amount in paisa
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${env.VITE_API_URL}/booking-success/${bookingId}`,
      cancel_url: `${env.VITE_API_URL}/checkout/${showId}`,
      metadata: {
        userId,
        bookingId,
        showId,
        bookedSeats: JSON.stringify(seats),
      },
    });

    if (!session.url) {
      throw new CustomError(
        ERROR_MESSAGES.GENERAL.FAILED_TO_CREATE_STRIPE_SESSION,
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
    return session.url;
  }
}
