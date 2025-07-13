import { Document, Types } from 'mongoose';

export interface IShow extends Document {
  startTime: Date;
  endTime?: Date;
  movieId: Types.ObjectId;
  theaterId: Types.ObjectId;
  screenId: Types.ObjectId;
  vendorId: Types.ObjectId;
  status: 'Scheduled' | 'Running' | 'Completed' | 'Cancelled';
  showDate: Date;
  bookedSeats: {
    date: Date;
    isPending: boolean;
    seatNumber: string;
    seatPrice: number;
    type: 'VIP' | 'Regular' | 'Premium';
    position: { row: number; col: number };
    userId: Types.ObjectId;
  }[];
}
