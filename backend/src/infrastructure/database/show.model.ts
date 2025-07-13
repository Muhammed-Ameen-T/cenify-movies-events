import mongoose, { Schema, Document } from 'mongoose';
import { IShow } from '../../domain/interfaces/model/show.interface';

const ShowSchema = new Schema<IShow>(
  {
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    movieId: { type: Schema.Types.ObjectId, ref: 'Movie', required: true },
    theaterId: { type: Schema.Types.ObjectId, ref: 'Theater', required: true },
    screenId: { type: Schema.Types.ObjectId, ref: 'Screen', required: true },
    status: {
      type: String,
      enum: ['Scheduled', 'Running', 'Completed', 'Cancelled'],
      required: true,
    },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
    showDate: { type: Date, required: true },
    bookedSeats: [
      {
        date: { type: Date, required: true },
        isPending: { type: Boolean, default: false },
        seatNumber: { type: String, required: true },
        seatPrice: { type: Number, required: true },
        type: { type: String, enum: ['VIP', 'Regular', 'Premium'], required: true },
        position: { row: Number, col: Number },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      },
    ],
  },
  { timestamps: true },
);

const Show = mongoose.model<IShow>('Show', ShowSchema);
export default Show;
