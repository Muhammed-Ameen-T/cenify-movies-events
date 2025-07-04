import { Types } from 'mongoose';

export class Booking {
  constructor(
    public _id: Types.ObjectId | null, // Use Types.ObjectId
    public showId: Types.ObjectId, // Use Types.ObjectId
    public userId: Types.ObjectId, // Use Types.ObjectId
    public bookedSeatsId: Types.ObjectId[],
    public bookingId: string,
    public status: 'confirmed' | 'cancelled',
    public payment: {
      amount: number;
      method: 'wallet' | 'online' | 'stripe';
      paymentId?: string;
      status: 'pending' | 'completed';
    },
    public qrCode: string,
    public subTotal: number,
    public couponDiscount: number,
    public couponApplied: boolean,
    public convenienceFee: number,
    public donation: number,
    public moviePassApplied: boolean,
    public moviePassDiscount: number,
    public totalDiscount: number,
    public totalAmount: number,
    public offerDiscount?: number,
    public expiresAt?: Date,
    public reason?: string | null,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}
}
