// src/application/usecases/wallet/withdrawFunds.usecase.ts
import { IWithdrawFundsUseCase } from '../../../domain/interfaces/useCases/Vendor/withdrawFunds.interface';
import { injectable, inject } from 'tsyringe';
import { IUserRepository } from '../../../domain/interfaces/repositories/user.repository';
import { IWalletRepository } from '../../../domain/interfaces/repositories/wallet.repository';
import { StripeWithdrawService } from '../../../infrastructure/services/stripeWithdraw.service';
import { CustomError } from '../../../utils/errors/custom.error';
import ERROR_MESSAGES from '../../../utils/constants/commonErrorMsg.constants';
import { HttpResCode } from '../../../utils/constants/httpResponseCode.utils';

@injectable()
export class WithdrawFundsUseCase implements IWithdrawFundsUseCase {
  constructor(
    @inject('IUserRepository') private userRepository: IUserRepository,
    @inject('WalletRepository') private walletRepository: IWalletRepository,
  ) {}

  async execute(
    userId: string,
    amount: number,
    stripeAccountId: string,
  ): Promise<{ success: boolean; balance: number }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new CustomError(ERROR_MESSAGES.AUTHENTICATION.USER_NOT_FOUND, HttpResCode.NOT_FOUND);
    }

    if (!stripeAccountId) {
      throw new CustomError(
        ERROR_MESSAGES.VALIDATION.MISSING_REQUIRED_FIELDS,
        HttpResCode.BAD_REQUEST,
      );
    }

    const wallet = await this.walletRepository.findByUserId(userId);
    if (!wallet || wallet.balance < amount) {
      throw new CustomError(ERROR_MESSAGES.GENERAL.INSUFFICIENT_BALANCE, HttpResCode.BAD_REQUEST);
    }

    await StripeWithdrawService(stripeAccountId, amount);

    const updatedWallet = await this.walletRepository.pushTransactionAndUpdateBalance(userId, {
      amount: amount,
      remark: `₹${amount} withdrawn to Stripe Account: ${stripeAccountId}.`,
      type: 'debit',
      source: 'topup',
      createdAt: new Date(),
    });
    if (!updatedWallet) {
      throw new CustomError(
        ERROR_MESSAGES.GENERAL.FAILED_UPDATING_WALLET,
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      success: true,
      balance: updatedWallet.balance,
    };
  }
}
