import { Transaction } from '../../../entities/wallet.entity';

export interface IFindUserWalletTransactionsUseCase {
  execute(
    userId: string,
    page: number,
    limit: number,
    filter?: 'credit' | 'debit' | 'all',
  ): Promise<{
    transactions: Transaction[];
    total: number;
    creditCount: number;
    debitCount: number;
  }>;
}
