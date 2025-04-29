import mongoose, { Schema } from 'mongoose';
import { IVendor } from '../../domain/interfaces/vendor.interface';

const VendorSchema: Schema<IVendor> = new Schema(
  {
    screens: [{ type: Schema.Types.ObjectId }],
    name: { type: String, required: true },
    status: { type: String, required: true, enum: ['pending', 'verified', 'blocked'] },
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
    password: { type: String },
    rating: { type: Number },
    accountType: { type: String, enum: ['theater', 'event'], required: true },
  },
  { timestamps: true },
);

export const VendorModel = mongoose.model<IVendor>('Vendor', VendorSchema);
