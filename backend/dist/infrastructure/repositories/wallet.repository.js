"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletRepository = void 0;
const wallet_entity_1 = require("../../domain/entities/wallet.entity");
const wallet_model_1 = __importDefault(require("../database/wallet.model"));
const commonErrorMsg_constants_1 = __importDefault(require("../../utils/constants/commonErrorMsg.constants"));
const custom_error_1 = require("../../utils/errors/custom.error");
const httpResponseCode_utils_1 = require("../../utils/constants/httpResponseCode.utils");
const mongoose_1 = __importDefault(require("mongoose"));
const user_model_1 = require("../database/user.model");
class WalletRepository {
    async findById(id) {
        try {
            const doc = await wallet_model_1.default.findById(id).lean();
            return doc ? this.mapToEntity(doc) : null;
        }
        catch (error) {
            console.error('❌ Error finding wallet by ID:', error);
            throw new Error(commonErrorMsg_constants_1.default.GENERAL.FAILED_FINDING_WALLET);
        }
    }
    async findByUserId(userId) {
        try {
            const doc = await wallet_model_1.default.findOne({ userId }).lean();
            return doc ? this.mapToEntity(doc) : null;
        }
        catch (error) {
            console.error('❌ Error finding wallet by user ID:', error);
            throw new Error(commonErrorMsg_constants_1.default.GENERAL.FAILED_FINDING_WALLET);
        }
    }
    async createWallet(wallet) {
        try {
            const newDoc = new wallet_model_1.default(wallet);
            const saved = await newDoc.save();
            return this.mapToEntity(saved);
        }
        catch (error) {
            console.error('❌ Error creating wallet:', error);
            throw new Error(commonErrorMsg_constants_1.default.GENERAL.FAILED_CREATING_WALLET);
        }
    }
    async updateWallet(id, update) {
        try {
            const updated = await wallet_model_1.default.findByIdAndUpdate(id, update, { new: true }).lean();
            return updated ? this.mapToEntity(updated) : null;
        }
        catch (error) {
            console.error('❌ Error updating wallet:', error);
            throw new Error(commonErrorMsg_constants_1.default.GENERAL.FAILED_UPDATING_WALLET);
        }
    }
    async pushTransaction(userId, transaction) {
        try {
            const updated = await wallet_model_1.default.findOneAndUpdate({ userId }, { $push: { transactions: transaction } }, { new: true }).lean();
            return updated ? this.mapToEntity(updated) : null;
        }
        catch (error) {
            console.error('❌ Error pushing transaction to wallet:', error);
            throw new Error(commonErrorMsg_constants_1.default.GENERAL.FAILED_UPDATING_WALLET);
        }
    }
    async pushTransactionAndUpdateBalance(userId, transaction) {
        try {
            const wallet = await wallet_model_1.default.findOne({ userId });
            if (!wallet)
                return null;
            const currentBalance = wallet.balance;
            const adjustment = transaction.type === 'credit'
                ? currentBalance + transaction.amount
                : currentBalance - transaction.amount;
            const updated = await wallet_model_1.default.findOneAndUpdate({ userId }, {
                $push: { transactions: transaction },
                $set: { balance: adjustment.toFixed(2) },
            }, { new: true }).lean();
            return updated ? this.mapToEntity(updated) : null;
        }
        catch (error) {
            console.error('❌ Error updating balance and pushing transaction:', error);
            throw new Error(commonErrorMsg_constants_1.default.GENERAL.FAILED_UPDATING_WALLET);
        }
    }
    async walletbalance(userId) {
        const wallet = await wallet_model_1.default.findOne({ userId });
        return wallet?.balance;
    }
    async findTransactionsByUserId(userId, page, limit, filter = 'all') {
        try {
            // Validate and convert userId to ObjectId
            let objectId;
            try {
                objectId = new mongoose_1.default.Types.ObjectId(userId);
            }
            catch (error) {
                console.error('❌ Invalid userId format:', userId);
                throw new custom_error_1.CustomError('Invalid user ID format', httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            // Check if wallet exists
            const wallet = await wallet_model_1.default.findOne({ userId: objectId }).lean();
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
            const result = await wallet_model_1.default.aggregate([
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
            const transactions = agg.transactions?.map((t) => ({
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
        }
        catch (error) {
            console.error('❌ Error finding transactions by user ID:', error);
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.GENERAL.FAILED_FINDING_WALLET, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
    }
    async redeemLoyalityPointsAndUpdateWallet(userId, amount, transaction) {
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            const user = await user_model_1.UserModel.findById(userId).session(session);
            if (!user?.loyalityPoints) {
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.GENERAL.FAILED_FINDING_LOYALITYPOINTS, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
            }
            if (!user || user.loyalityPoints < amount)
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.GENERAL.INSUFFIENT_BALANCE, httpResponseCode_utils_1.HttpResCode.NOT_ACCEPTABLE);
            const wallet = await wallet_model_1.default.findOne({ userId }).session(session);
            if (!wallet)
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.GENERAL.WALLET_NOT_FOUND, httpResponseCode_utils_1.HttpResCode.NO_CONTENT);
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
        }
        catch (error) {
            await session.abortTransaction();
            session.endSession();
            console.error('❌ Failed to redeem loyalty points and update wallet:', error);
            throw new Error('Transaction failed');
        }
    }
    mapToEntity(doc) {
        return new wallet_entity_1.Wallet(doc._id?.toString(), doc.userId.toString(), doc.balance, doc.transactions, doc.createdAt, doc.updatedAt);
    }
}
exports.WalletRepository = WalletRepository;
