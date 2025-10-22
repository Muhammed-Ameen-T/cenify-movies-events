// src/application/usecases/payment/checkPaymentOptions.usecase.ts

import { inject, injectable } from 'tsyringe';
import { ICheckPaymentOptionsUseCase } from '../../../domain/interfaces/useCases/User/checkPaymentOptions.interface';
import { IMoviePassRepository } from '../../../domain/interfaces/repositories/moviePass.repository';
import { IWalletRepository } from '../../../domain/interfaces/repositories/wallet.repository';
import { PaymentService } from '../../../infrastructure/services/checkoutPayment.service';

@injectable()
export class CheckPaymentOptionsUseCase implements ICheckPaymentOptionsUseCase {
  constructor(
    @inject('PaymentService') private _paymentService: PaymentService,
    @inject('MoviePassRepository') private _moviePassRepository: IMoviePassRepository,
    @inject('WalletRepository') private _walletRepository: IWalletRepository,
  ) {}

  async execute(
    userId: string,
    totalAmount: number,
  ): Promise<{
    wallet: { enabled: boolean; balance: number };
    stripe: { enabled: boolean };
    moviePass: { active: boolean };
  }> {
    const hasSufficientWalletBalance = await this._paymentService.checkWalletBalance(
      userId,
      totalAmount,
    );
    const moviePass = await this._moviePassRepository.findByUserId(userId);
    const isMoviePassActive = moviePass?.status === 'Active';
    const wallet = await this._walletRepository.findByUserId(userId);

    return {
      wallet: {
        enabled: hasSufficientWalletBalance,
        balance: wallet?.balance ?? 0,
      },
      stripe: { enabled: true },
      moviePass: { active: isMoviePassActive },
    };
  }
}
