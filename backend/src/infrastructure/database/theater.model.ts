// src/infrastructure/database/theater.model.ts
import mongoose, { Schema } from 'mongoose';
import { ITheater } from '../../domain/interfaces/model/thaeter.interface';

const TheaterSchema: Schema<ITheater> = new Schema(
  {
    screens: [{ type: Schema.Types.ObjectId }],
    name: { type: String, required: true },
    status: { type: String, required: true, enum: ['pending', 'verified', 'verifying', 'blocked'] },
    location: {
      city: { type: String },
      coordinates: [{ type: Number }], // [longitude, latitude]
      type: { type: String, enum: ['Point'], default: 'Point' }, // Changed to uppercase 'Point'
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
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

TheaterSchema.index({ location: '2dsphere' });

export const TheaterModel = mongoose.model<ITheater>('Theater', TheaterSchema);
