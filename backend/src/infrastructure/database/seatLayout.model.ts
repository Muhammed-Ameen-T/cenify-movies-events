// src/infrastructure/database/seatLayout.model.ts
import mongoose, { Schema, Document } from 'mongoose';
import { ISeatLayout } from '../../domain/interfaces/model/seatLayout.interface';

const SeatLayoutSchema = new Schema<ISeatLayout>(
  {
    uuid: { type: String, required: true, unique: true, index: true },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
    layoutName: { type: String, required: true },
    seatPrice: {
      regular: { type: Number, required: true },
      premium: { type: Number, required: true },
      vip: { type: Number, required: true },
    },
    capacity: { type: Number, required: true },
    seatIds: [{ type: Schema.Types.ObjectId, ref: 'Seat' }],
    rowCount: { type: Number, required: true, min: 1 },
    columnCount: { type: Number, required: true, min: 1 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export default mongoose.model<ISeatLayout>('SeatLayout', SeatLayoutSchema);
