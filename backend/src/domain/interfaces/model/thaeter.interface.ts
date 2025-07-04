import mongoose, { Document, ObjectId } from 'mongoose';

export interface ITheater extends Document {
  _id: string;
  screens: string[] | null;
  name: string;
  status: string;
  location: {
    city: string | null;
    coordinates: number[] | null;
    type: string | null;
  } | null;
  facilities: {
    foodCourt: boolean | null;
    lounges: boolean | null;
    mTicket: boolean | null;
    parking: boolean | null;
    freeCancellation: boolean | null;
  } | null;
  intervalTime: number | null;
  gallery: string[] | null;
  email: string | null;
  phone: number | null;
  description: string | null;
  vendorId: mongoose.Types.ObjectId;
  rating: number | null;
  ratingCount: number;
  createdAt: Date;
  updatedAt: Date;
}
