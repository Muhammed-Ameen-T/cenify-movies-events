"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = exports.Wallet = void 0;
class Wallet {
    constructor(_id, userId, balance, transactions, createdAt, updatedAt) {
        this._id = _id;
        this.userId = userId;
        this.balance = balance;
        this.transactions = transactions;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}
exports.Wallet = Wallet;
class Transaction {
    constructor(id, amount, type, source, createdAt, status, remark) {
        this.id = id;
        this.amount = amount;
        this.type = type;
        this.source = source;
        this.createdAt = createdAt;
        this.status = status;
        this.remark = remark;
    }
}
exports.Transaction = Transaction;
