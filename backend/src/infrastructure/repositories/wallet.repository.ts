import { IWalletRepository } from '../../domain/interfaces/repositories/wallet.repository';
import { Wallet } from '../../domain/entities/wallet.entity';
import WalletModel from '../database/wallet.model';
import ERROR_MESSAGES from '../../utils/constants/commonErrorMsg.constants';
import { CustomError } from '../../utils/errors/custom.error';
import { Transaction } from 'ioredis/built/transaction';
import { HttpResCode } from '../../utils/constants/httpResponseCode.utils';
import mongoose from 'mongoose';
import { UserModel } from '../database/user.model';

export class WalletRepository implements IWalletRepository {
  async findById(id: string): Promise<Wallet | null> {
    try {
      const doc = await WalletModel.findById(id).lean();
      return doc ? this.mapToEntity(doc) : null;
    } catch (error) {
      console.error('❌ Error finding wallet by ID:', error);
      throw new Error(ERROR_MESSAGES.GENERAL.FAILED_FINDING_WALLET);
    }
  }

  async findByUserId(userId: string): Promise<Wallet | null> {
    try {
      const doc = await WalletModel.findOne({ userId }).lean();
      return doc ? this.mapToEntity(doc) : null;
    } catch (error) {
      console.error('❌ Error finding wallet by user ID:', error);
      throw new Error(ERROR_MESSAGES.GENERAL.FAILED_FINDING_WALLET);
    }
  }

  async createWallet(wallet: Wallet): Promise<Wallet> {
    try {
      const newDoc = new WalletModel(wallet);
      const saved = await newDoc.save();
      return this.mapToEntity(saved);
    } catch (error) {
      console.error('❌ Error creating wallet:', error);
      throw new Error(ERROR_MESSAGES.GENERAL.FAILED_CREATING_WALLET);
    }
  }

  async updateWallet(id: string, update: Partial<Wallet>): Promise<Wallet | null> {
    try {
      const updated = await WalletModel.findByIdAndUpdate(id, update, { new: true }).lean();
      return updated ? this.mapToEntity(updated) : null;
    } catch (error) {
      console.error('❌ Error updating wallet:', error);
      throw new Error(ERROR_MESSAGES.GENERAL.FAILED_UPDATING_WALLET);
    }
  }

  async pushTransaction(
    userId: string,
    transaction: Wallet['transactions'][number],
  ): Promise<Wallet | null> {
    try {
      const updated = await WalletModel.findOneAndUpdate(
        { userId },
        { $push: { transactions: transaction } },
        { new: true },
      ).lean();
      return updated ? this.mapToEntity(updated) : null;
    } catch (error) {
      console.error('❌ Error pushing transaction to wallet:', error);
      throw new Error(ERROR_MESSAGES.GENERAL.FAILED_UPDATING_WALLET);
    }
  }

  async pushTransactionAndUpdateBalance(
    userId: string,
    transaction: {
      amount: number;
      remark?: string;
      type: 'debit' | 'credit';
      source: 'loyality' | 'refund' | 'topup' | 'booking';
      createdAt: Date;
    },
  ): Promise<Wallet | null> {
    try {
      const wallet = await WalletModel.findOne({ userId });
      if (!wallet) return null;

      const currentBalance = wallet.balance;
      const adjustment =
        transaction.type === 'credit'
          ? currentBalance + transaction.amount
          : currentBalance - transaction.amount;

      const updated = await WalletModel.findOneAndUpdate(
        { userId },
        {
          $push: { transactions: transaction },
          $set: { balance: adjustment.toFixed(2) },
        },
        { new: true },
      ).lean();

      return updated ? this.mapToEntity(updated) : null;
    } catch (error) {
      console.error('❌ Error updating balance and pushing transaction:', error);
      throw new Error(ERROR_MESSAGES.GENERAL.FAILED_UPDATING_WALLET);
    }
  }

  async walletbalance(userId: string): Promise<number | undefined> {
    const wallet = await WalletModel.findOne({ userId });
    return wallet?.balance;
  }

  async findTransactionsByUserId(
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
      // Validate and convert userId to ObjectId
      let objectId;
      try {
        objectId = new mongoose.Types.ObjectId(userId);
      } catch (error) {
        console.error('❌ Invalid userId format:', userId);
        throw new CustomError('Invalid user ID format', HttpResCode.BAD_REQUEST);
      }

      // Check if wallet exists
      const wallet = await WalletModel.findOne({ userId: objectId }).lean();
      if (!wallet || !wallet.transactions?.length) {
        return {
          transactions: [],
          total: 0,
          creditCount: 0,
          debitCount: 0,
          totalCredit: 0,
          totalDebit: 0,
        };
      }

      // Base query
      const query = { userId: objectId };

      // Aggregation pipeline
      const result = await WalletModel.aggregate([
        { $match: query },
        { $unwind: '$transactions' },
        ...(filter !== 'all' ? [{ $match: { 'transactions.type': filter } }] : []),
        {
          $facet: {
            transactions: [
              { $sort: { 'transactions.createdAt': -1 } },
              { $skip: (page - 1) * limit },
              { $limit: limit },
              {
                $project: {
                  id: '$transactions._id',
                  amount: '$transactions.amount',
                  remark: '$transactions.remark',
                  type: '$transactions.type',
                  source: '$transactions.source',
                  createdAt: '$transactions.createdAt',
                },
              },
            ],
            total: [{ $count: 'count' }],
            allTransactions: [
              {
                $group: {
                  _id: '$transactions.type',
                  count: { $sum: 1 },
                  totalAmount: { $sum: '$transactions.amount' },
                },
              },
            ],
          },
        },
        {
          $project: {
            transactions: 1,
            total: { $arrayElemAt: ['$total.count', 0] },
            creditStats: {
              $arrayElemAt: [
                {
                  $filter: {
                    input: '$allTransactions',
                    as: 'item',
                    cond: { $eq: ['$$item._id', 'credit'] },
                  },
                },
                0,
              ],
            },
            debitStats: {
              $arrayElemAt: [
                {
                  $filter: {
                    input: '$allTransactions',
                    as: 'item',
                    cond: { $eq: ['$$item._id', 'debit'] },
                  },
                },
                0,
              ],
            },
          },
        },
        {
          $project: {
            transactions: 1,
            total: { $ifNull: ['$total', 0] },
            creditCount: { $ifNull: ['$creditStats.count', 0] },
            debitCount: { $ifNull: ['$debitStats.count', 0] },
            totalCredit: { $ifNull: ['$creditStats.totalAmount', 0] },
            totalDebit: { $ifNull: ['$debitStats.totalAmount', 0] },
          },
        },
      ]).exec();

      const agg = result[0] || {};

      const transactions =
        agg.transactions?.map((t: any) => ({
          id: t.id.toString(),
          amount: t.amount,
          remark: t.remark || '',
          type: t.type,
          source: t.source,
          createdAt: t.createdAt,
        })) || [];

      return {
        transactions,
        total: agg.total || 0,
        creditCount: agg.creditCount || 0,
        debitCount: agg.debitCount || 0,
        totalCredit: agg.totalCredit || 0,
        totalDebit: agg.totalDebit || 0,
      };
    } catch (error) {
      console.error('❌ Error finding transactions by user ID:', error);
      throw new CustomError(
        ERROR_MESSAGES.GENERAL.FAILED_FINDING_WALLET,
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async redeemLoyalityPointsAndUpdateWallet(
    userId: string,
    amount: number,
    transaction: {
      amount: number;
      remark?: string;
      type: 'debit' | 'credit';
      source: 'loyality';
      createdAt: Date;
    },
  ): Promise<Wallet | null> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const user = await UserModel.findById(userId).session(session);
      if (!user?.loyalityPoints) {
        throw new CustomError(
          ERROR_MESSAGES.GENERAL.FAILED_FINDING_LOYALITYPOINTS,
          HttpResCode.INTERNAL_SERVER_ERROR,
        );
      }
      if (!user || user.loyalityPoints < amount)
        throw new CustomError(
          ERROR_MESSAGES.GENERAL.INSUFFIENT_BALANCE,
          HttpResCode.NOT_ACCEPTABLE,
        );

      const wallet = await WalletModel.findOne({ userId }).session(session);
      if (!wallet)
        throw new CustomError(ERROR_MESSAGES.GENERAL.WALLET_NOT_FOUND, HttpResCode.NO_CONTENT);

      // Deduct loyalty points
      user.loyalityPoints -= amount;
      await user.save({ session });

      // Update wallet balance
      wallet.balance += amount;
      wallet.transactions.push({
        ...transaction,
        remark: transaction.remark ?? '',
      });
      await wallet.save({ session });

      await session.commitTransaction();
      session.endSession();

      return this.mapToEntity(wallet);
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error('❌ Failed to redeem loyalty points and update wallet:', error);
      throw new Error('Transaction failed');
    }
  }

  private mapToEntity(doc: any): Wallet {
    return new Wallet(
      doc._id?.toString(),
      doc.userId.toString(),
      doc.balance,
      doc.transactions,
      doc.createdAt,
      doc.updatedAt,
    );
  }
}
