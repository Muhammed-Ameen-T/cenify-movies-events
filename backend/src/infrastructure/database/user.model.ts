import mongoose, { Schema } from 'mongoose';
import { IUser } from '../../domain/interfaces/model/user.interface';

const userSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, default: null },
    phone: { type: Number, default: null },
    authId: { type: String, default: null },
    password: { type: String },
    profileImage: { type: String, default: null },
    dob: { type: Date },
    moviePass: {
      buyDate: { type: Date, default: null },
      expiryDate: { type: Date, default: null },
      isPass: { type: Boolean, default: null },
    },
    loyalityPoints: { type: Number, default: 0 },
    isBlocked: { type: Boolean, default: false },
    role: { type: String },
  },
  { timestamps: true },
);

export const UserModel = mongoose.model<IUser>('User', userSchema);
