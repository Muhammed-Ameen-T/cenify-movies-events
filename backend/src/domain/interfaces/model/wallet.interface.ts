import { Document, ObjectId, Types } from 'mongoose';

export interface IWallet extends Document {
  _id: ObjectId;
  userId: Types.ObjectId;
  balance: number;
  transactions: {
    amount: number;
    remark: string;
    type: 'debit' | 'credit';
    source: 'loyality' | 'refund' | 'topup' | 'booking';
    createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}
