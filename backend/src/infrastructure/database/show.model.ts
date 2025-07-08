import mongoose, { Schema, Document } from 'mongoose';

// Interface for Seat
export interface ISeat extends Document {
  number: string;
  type: 'VIP' | 'Regular' | 'Premium';
  price: number;
  position: { row: number; col: number };
}

// Seat Schema
const SeatSchema = new Schema<ISeat>({
  number: { type: String, required: true },
  type: { type: String, enum: ['VIP', 'Regular', 'Premium'], required: true },
  price: { type: Number, required: true },
  position: {
    row: { type: Number, required: true },
    col: { type: Number, required: true },
  },
});

// Interface for Seat Layout
export interface ISeatLayout extends Document {
  vendorId: mongoose.Types.ObjectId;
  capacity: number; 
  seats: ISeat[][]; 
}

// Seat Layout Schema
const SeatLayoutSchema = new Schema<ISeatLayout>({
  vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
  capacity: { type: Number, required: true },
  seats: { type: [[SeatSchema]], required: true },
});

// Interface for Screen
export interface IScreen extends Document {
  seatLayoutId: mongoose.Types.ObjectId;
  theaterId: mongoose.Types.ObjectId;
  vendorId: mongoose.Types.ObjectId;
  filledTimes: {
    startTime: Date;
    endTime: Date;
    showId: mongoose.Types.ObjectId;
  }[];
  amenities: string[];
}

// Screen Schema
const ScreenSchema = new Schema<IScreen>({
  seatLayoutId: { type: Schema.Types.ObjectId, ref: 'SeatLayout', required: true },
  theaterId: { type: Schema.Types.ObjectId, ref: 'Theater', required: true, index: true },
  vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
  filledTimes: [
    {
      startTime: { type: Date, required: true },
      endTime: { type: Date, required: true },
      showId: { type: Schema.Types.ObjectId, ref: 'Shows', required: true },
    },
  ],
  amenities: { type: [String], default: [] },
});

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

// Model Exports
export const Seat = mongoose.model<ISeat>('Seat', SeatSchema);
export const SeatLayout = mongoose.model<ISeatLayout>('SeatLayout', SeatLayoutSchema);
export const Screen = mongoose.model<IScreen>('Screen', ScreenSchema);
export const Show = mongoose.model<IShow>('Show', ShowSchema);