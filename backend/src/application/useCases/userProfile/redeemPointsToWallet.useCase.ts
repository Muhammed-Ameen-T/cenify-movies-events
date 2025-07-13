import { inject, injectable } from 'tsyringe';
import { IWalletRepository } from '../../../domain/interfaces/repositories/wallet.repository';
import { Wallet } from '../../../domain/entities/wallet.entity';
import { CustomError } from '../../../utils/errors/custom.error';
import { HttpResCode } from '../../../utils/constants/httpResponseCode.utils';
import ERROR_MESSAGES from '../../../utils/constants/commonErrorMsg.constants';
import { IRedeemLoyalityToWalletUseCase } from '../../../domain/interfaces/useCases/User/redeemLoyalityToWallet.interface';

@injectable()
export class RedeemLoyalityToWalletUseCase implements IRedeemLoyalityToWalletUseCase {
  constructor(@inject('WalletRepository') private walletRepository: IWalletRepository) {}

  async execute(userId: string, amount: number): Promise<Wallet> {
    try {
      const transaction = {
        amount: amount,
        remark: `${amount} Loyaly points Redeemed and amount credited to wallet.`,
        type: 'credit' as 'credit',
        source: 'loyality' as 'loyality',
        createdAt: new Date(),
      };

      const updatedWallet = await this.walletRepository.redeemLoyalityPointsAndUpdateWallet(
        userId,
        amount,
        transaction,
      );

      if (!updatedWallet) {
        throw new CustomError(ERROR_MESSAGES.GENERAL.FAILED_REDEEMING_POINTS);
      }

      return updatedWallet;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError(
        ERROR_MESSAGES.GENERAL.SOMETHING_WENT_WRONG,
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
