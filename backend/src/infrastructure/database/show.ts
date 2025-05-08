import mongoose, { Schema, Document } from 'mongoose';

// Interface for Seat
export interface ISeat extends Document {
  number: string;
  type: 'VIP' | 'Regular' | 'Premium' | 'Executive';
  price: number;
  position: { row: number; col: number };
}

// Seat Schema
const SeatSchema = new Schema<ISeat>({
  number: { type: String, required: true },
  type: { type: String, enum: ['VIP', 'Regular', 'Premium', 'Executive'], required: true },
  price: { type: Number, required: true },
  position: { row: Number, col: Number },
});

// Interface for Seat Layout
export interface ISeatLayout extends Document {
  vendorId: string; // Who created this layout
  capacity: number; // Total seat count
  seats: ISeat[][]; // 2D array for layout
}

// Seat Layout Schema
const SeatLayoutSchema = new Schema<ISeatLayout>({
  vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
  capacity: { type: Number, required: true },
  seats: [[SeatSchema]], // 2D Array storing seat details
});

//  Interface for Screen
export interface IScreen extends Document {
  seatLayoutId: string;
  theaterId: string;
  vendorId: string;
  filledTimes: {
    startTime: Date;
    endTime: Date;
    showId: string;
  }[];
  amenities: string[]; 
}

// Screen Schema
const ScreenSchema = new Schema<IScreen>({
  seatLayoutId: { type: Schema.Types.ObjectId, ref: 'SeatLayout', required: true },
  theaterId: { type: Schema.Types.ObjectId, ref: 'Theater', required: true },
  vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
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
  movieId: string;
  theaterId: string;
  screenId: string;
  status: 'Scheduled' | 'Running' | 'Completed' | 'Cancelled';
  bookedSeats: {
    date: Date;
    isPending: boolean;
    seatNumber: string;
    seatPrice: number;
    type: 'VIP' | 'Regular' | 'Premium';
    userId: string;
  }[];
}

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

export const Seat = mongoose.model<ISeat>('Seat', SeatSchema);
export const SeatLayout = mongoose.model<ISeatLayout>('SeatLayout', SeatLayoutSchema);
export const Screen = mongoose.model<IScreen>('Screen', ScreenSchema);
export const Show = mongoose.model<IShow>('Show', ShowSchema);