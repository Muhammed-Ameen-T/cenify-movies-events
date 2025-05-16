import mongoose, { Schema, Document } from 'mongoose';

export interface ISeatLayout extends Document {
  _id: mongoose.Types.ObjectId;
  uuid: string;
  vendorId: mongoose.Types.ObjectId;
  layoutName: string;
  seatPrice: { regular: number; premium: number; vip: number };
  capacity: number;
  seatIds: mongoose.Types.ObjectId[];
  rowCount: number;
  columnCount: number;
  createdAt: Date;
  updatedAt: Date;
}