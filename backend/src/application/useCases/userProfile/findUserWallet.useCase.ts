import { inject, injectable } from 'tsyringe';
import { IFindUserWalletUseCase } from '../../../domain/interfaces/useCases/User/findUserWallet.interface';
import { CustomError } from '../../../utils/errors/custom.error';
import { HttpResCode } from '../../../utils/constants/httpResponseCode.utils';
import ERROR_MESSAGES from '../../../utils/constants/commonErrorMsg.constants';
import { IWalletRepository } from '../../../domain/interfaces/repositories/wallet.repository';
import { Wallet } from '../../../domain/entities/wallet.entity';

@injectable()
export class FindUserWalletUseCase implements IFindUserWalletUseCase {
  constructor(@inject('WalletRepository') private walletRepository: IWalletRepository) {}

  async execute(userId: string): Promise<Wallet> {
    try {
      const wallet = await this.walletRepository.findByUserId(userId);
      if (!wallet) {
        throw new CustomError(ERROR_MESSAGES.DATABASE.RECORD_NOT_FOUND, HttpResCode.NOT_FOUND);
      }
      return wallet;
    } catch (error) {
      throw new CustomError(ERROR_MESSAGES.DATABASE.RECORD_NOT_FOUND, HttpResCode.NOT_FOUND);
    }
  }
}
