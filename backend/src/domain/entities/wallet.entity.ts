export class Wallet {
  constructor(
    public _id: string | null,
    public userId: string,
    public balance: number,
    public transactions: {
      amount: number;
      remark?: string;
      type: 'debit' | 'credit';
      source: 'loyality' | 'refund' | 'topup' | 'booking';
      createdAt: Date;
    }[],
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}
}

export interface Transaction {
  id: string;
  amount: number;
  remark?: string;
  type: 'credit' | 'debit';
  source: 'loyality' | 'refund' | 'topup' | 'booking';
  createdAt: string;
  status: 'completed' | 'pending' | 'failed';
}
export class Transaction {
  constructor(
    public id: string,
    public amount: number,
    public type: 'credit' | 'debit',
    public source: 'loyality' | 'refund' | 'topup' | 'booking',
    public createdAt: string,
    public status: 'completed' | 'pending' | 'failed',
    public remark?: string,
  ) {}
}
