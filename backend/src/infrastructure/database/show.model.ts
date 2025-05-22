import mongoose, { Schema, Document } from 'mongoose';

// Interface for Show
export interface IShow extends Document {
  showTime: Date;
  movieId: mongoose.Types.ObjectId;
  theaterId: mongoose.Types.ObjectId;
  screenId: mongoose.Types.ObjectId;
  status: 'Scheduled' | 'Running' | 'Completed' | 'Cancelled';
  bookedSeats: {
    date: Date;
    isPending: boolean;
    seatNumber: string;
    seatPrice: number;
    type: 'VIP' | 'Regular' | 'Premium';
    userId: mongoose.Types.ObjectId;
  }[];
}

// Show Schema
const ShowSchema = new Schema<IShow>({
  showTime: { type: Date, required: true },
  movieId: { type: Schema.Types.ObjectId, ref: 'Movie', required: true },
  theaterId: { type: Schema.Types.ObjectId, ref: 'Theater', required: true },
  screenId: { type: Schema.Types.ObjectId, ref: 'Screen', required: true },
  status: { type: String, enum: ['Scheduled', 'Running', 'Completed', 'Cancelled'], required: true },
  bookedSeats: [
    {
      date: { type: Date, required: true },
      isPending: { type: Boolean, default: false },
      seatNumber: { type: String, required: true },
      seatPrice: { type: Number, required: true },
      type: { type: String, enum: ['VIP', 'Regular', 'Premium'], required: true },
      userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
  ],
});

export const Show = mongoose.model<IShow>('Show', ShowSchema);