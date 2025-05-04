import { Document } from 'mongoose';

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
  rating: number | null;
  createdAt: Date;
  updatedAt: Date;
}
