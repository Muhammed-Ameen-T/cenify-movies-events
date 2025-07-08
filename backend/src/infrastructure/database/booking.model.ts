import mongoose, { Schema } from 'mongoose';
import { IBooking } from '../../domain/interfaces/model/booking.interface';

const BookingSchema: Schema = new Schema(
  {
    showId: { type: Schema.Types.ObjectId, required: true, ref: 'Show' },
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    bookedSeatsId: [{ type: Schema.Types.ObjectId, required: true }],
    bookingId: { type: String, required: true },
    status: { type: String, enum: ['cancelled', 'confirmed'], required: true },
    payment: {
      amount: { type: Number, required: true },
      method: { type: String, enum: ['wallet', 'online', 'stripe'], required: true },
      paymentId: { type: String },
      status: { type: String, enum: ['pending', 'completed'], required: true },
    },
    qrCode: { type: String },
    subTotal: { type: Number, required: true },
    couponDiscount: { type: Number, required: true, default: 0 },
    couponApplied: { type: Boolean, required: true, default: false },
    convenienceFee: { type: Number, required: true },
    donation: { type: Number, required: true },
    moviePassApplied: { type: Boolean, required: true, default: false },
    moviePassDiscount: { type: Number, default: 0 },
    offerDiscount: { type: Number, default: 0 },
    totalDiscount: { type: Number, required: true, default: 0 },
    totalAmount: { type: Number, required: true },
    expiresAt: { type: Date },
    reason: { type: String },
  },
  { timestamps: true },
);

const BookingModel = mongoose.model<IBooking>('Booking', BookingSchema);

export default BookingModel;
