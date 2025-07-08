import mongoose, { Schema } from 'mongoose';
import { ITheater } from '../../domain/interfaces/thaeter.interface';

const TheaterSchema: Schema<ITheater> = new Schema(
  {
    screens: [{ type: Schema.Types.ObjectId }],
    name: { type: String, required: true },
    status: { type: String, required: true, enum: ['pending', 'verified', 'verifying' ,'blocked'] },
    location: {
      city: { type: String },
      coordinates: [{ type: Number }],
      type: { type: String, enum: ['point'], default: 'point' },
    },
    facilities: {
      foodCourt: { type: Boolean, default: false },
      lounges: { type: Boolean, default: false },
      mTicket: { type: Boolean, default: false },
      parking: { type: Boolean, default: false },
      freeCancellation: { type: Boolean, default: false },
    },
    intervalTime: { type: Number, enum: [5, 10, 15, 20, 30] },
    gallery: [{ type: String }],
    email: { type: String },
    phone: { type: Number },
    description: { type: String },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
    rating: { type: Number },
  },
  { timestamps: true },
);

export const TheaterModel = mongoose.model<ITheater>('Theaters', TheaterSchema);
