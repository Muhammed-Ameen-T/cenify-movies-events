import mongoose, { Schema, Document } from 'mongoose';
import { ISeat } from './seat.interface';
import { Seat } from '../../entities/seatLayout.entity';

export interface ISeatLayout extends Document {
  _id: mongoose.Types.ObjectId;
  uuid: string;
  vendorId: mongoose.Types.ObjectId;
  layoutName: string;
  seatPrice: { regular: number; premium: number; vip: number };
  capacity: number;
  seatIds: mongoose.Types.ObjectId[] | ISeat[] | Seat[];
  rowCount: number;
  columnCount: number;
  createdAt: Date;
  updatedAt: Date;
}
