import mongoose, { Schema, Document } from 'mongoose';
import { ISeat } from '../../domain/interfaces/model/seat.interface';

const SeatSchema = new Schema<ISeat>(
  {
    uuid: { type: String, required: true },
    seatLayoutId: { type: Schema.Types.ObjectId, ref: 'SeatLayout', required: true, index: true },
    number: { type: String, required: true },
    type: { type: String, enum: ['VIP', 'Regular', 'Premium', 'Unavailable'], required: true },
    price: { type: Number, required: true, default: 0 },
    position: {
      row: { type: Number, required: true },
      col: { type: Number, required: true },
    },
  },
  { timestamps: true },
);

export default mongoose.model<ISeat>('Seat', SeatSchema);
