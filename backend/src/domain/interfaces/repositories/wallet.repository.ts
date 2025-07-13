import { Transaction } from 'ioredis/built/transaction';
import { Wallet } from '../../entities/wallet.entity';

export interface IWalletRepository {
  findById(id: string): Promise<Wallet | null>;
  findByUserId(userId: string): Promise<Wallet | null>;
  createWallet(wallet: Wallet): Promise<Wallet>;
  updateWallet(id: string, update: Partial<Wallet>): Promise<Wallet | null>;
  pushTransaction(
    userId: string,
    transaction: {
      amount: number;
      remark?: string;
      type: 'debit' | 'credit';
      source: 'loyality' | 'refund' | 'topup' | 'booking';
      createdAt: Date;
    },
  ): Promise<Wallet | null>;
  pushTransactionAndUpdateBalance(
    userId: string,
    transaction: {
      amount: number;
      remark?: string;
      type: 'debit' | 'credit';
      source: 'loyality' | 'refund' | 'topup' | 'booking';
      createdAt: Date;
    },
  ): Promise<Wallet | null>;
  walletbalance(userId: string): Promise<number | undefined>;
  findTransactionsByUserId(
    userId: string,
    page: number,
    limit: number,
    filter?: 'credit' | 'debit' | 'all',
  ): Promise<{
    transactions: Transaction[];
    total: number;
    creditCount: number;
    debitCount: number;
    totalCredit: number;
    totalDebit: number;
  }>;
  redeemLoyalityPointsAndUpdateWallet(
    userId: string,
    amount: number,
    transaction: {
      amount: number;
      remark?: string;
      type: 'debit' | 'credit';
      source: 'loyality';
      createdAt: Date;
    },
  ): Promise<Wallet | null>;
}
