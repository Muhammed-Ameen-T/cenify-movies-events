import { inject, injectable } from 'tsyringe';
import { IWalletRepository } from '../../../domain/interfaces/repositories/wallet.repository';
import { Transaction } from '../../../domain/entities/wallet.entity';
import { CustomError } from '../../../utils/errors/custom.error';
import { HttpResCode } from '../../../utils/constants/httpResponseCode.utils';
import ERROR_MESSAGES from '../../../utils/constants/commonErrorMsg.constants';
import { IFindUserWalletTransactionsUseCase } from '../../../domain/interfaces/useCases/User/findUserTransaction.interface';

@injectable()
export class FindUserWalletTransactionsUseCase implements IFindUserWalletTransactionsUseCase {
  constructor(@inject('WalletRepository') private walletRepository: IWalletRepository) {}

  async execute(
    userId: string,
    page: number,
    limit: number,
    filter: 'credit' | 'debit' | 'all' = 'all',
  ): Promise<{
    transactions: Transaction[];
    total: number;
    creditCount: number;
    debitCount: number;
    totalCredit: number;
    totalDebit: number;
  }> {
    try {
      const result = await this.walletRepository.findTransactionsByUserId(
        userId,
        page,
        limit,
        filter,
      );

      const transactions: Transaction[] = result?.transactions.map(
        (t: any) =>
          new Transaction(t.id, t.amount, t.type, t.source, t.createdAt, t.status, t.remark),
      );
      return {
        transactions,
        total: result.total,
        creditCount: result.creditCount,
        debitCount: result.debitCount,
        totalCredit: result.totalCredit,
        totalDebit: result.totalDebit,
      };
    } catch (error) {
      throw new CustomError(ERROR_MESSAGES.DATABASE.RECORD_NOT_FOUND, HttpResCode.NOT_FOUND);
    }
  }
}
