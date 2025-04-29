import { Document, ObjectId } from 'mongoose';

export interface IUser extends Document {
  _id: ObjectId;
  name: string;
  email: string | null;
  phone: number | null;
  password: string | null;
  authId: string | null;
  profileImage: string | null;
  dob: Date;
  moviePass: {
    buyDate: Date | null;
    expiryDate: Date | null;
    isPass: boolean | null;
  };
  loyalityPoints: number | null;
  isBlocked: boolean | null;
  isAdmin: boolean | null;
  createdAt: Date;
  updatedAt: Date;
}
