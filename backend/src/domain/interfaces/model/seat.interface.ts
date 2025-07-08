// src/infrastructure/database/seat.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ISeat extends Document {
  _id: mongoose.Types.ObjectId;
  uuid: string;
  seatLayoutId: mongoose.Types.ObjectId;
  number: string;
  type: 'VIP' | 'Regular' | 'Premium' | 'Unavailable';
  price: number;
  position: { row: number; col: number };
  createdAt?: Date;
  updatedAt?: Date;
}
