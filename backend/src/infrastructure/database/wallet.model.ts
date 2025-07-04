import mongoose, { Schema } from 'mongoose';
import { IWallet } from '../../domain/interfaces/model/wallet.interface';

const WalletSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    balance: { type: Number, required: true },
    transactions: [
      {
        amount: { type: Number, required: true },
        remark: { type: String },
        type: { type: String, enum: ['debit', 'credit'], required: true },
        source: { type: String, enum: ['loyality', 'refund', 'topup', 'booking'], required: true },
        createdAt: { type: Date, required: true },
      },
    ],
  },
  { timestamps: true },
);

const WalletModel = mongoose.model<IWallet>('Wallet', WalletSchema);

export default WalletModel;
