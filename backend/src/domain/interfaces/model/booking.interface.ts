import { Document, ObjectId, Types } from 'mongoose';

export interface IBooking extends Document {
  _id: ObjectId;
  showId: Types.ObjectId;
  userId: Types.ObjectId;
  bookedSeatsId: Types.ObjectId[];
  bookingId: string;
  status: 'cancelled' | 'confirmed';
  payment: {
    amount: number;
    method: 'wallet' | 'online' | 'stripe';
    paymentId?: string;
    status: 'pending' | 'completed';
  };
  qrCode?: string;
  subTotal: number;
  couponDiscount: number;
  convenienceFee: number;
  couponApplied: boolean;
  donation: number;
  moviePassApplied: boolean;
  moviePassDiscount?: number;
  offerDiscount?: number;
  totalDiscount: number;
  totalAmount: number;
  expiresAt?: Date;
  reason?: string;
  createdAt: Date;
  updatedAt: Date;
}
