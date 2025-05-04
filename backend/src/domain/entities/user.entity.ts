import { ObjectId } from 'mongoose';

export class User {
  constructor(
    public _id: ObjectId,
    public name: string,
    public email: string,
    public phone: number | null,
    public authId: string | null,
    public password: string | null,
    public profileImage: string | null,
    public dob: Date | null,
    public moviePass: {
      buyDate: Date | null;
      expiryDate: Date | null;
      isPass: boolean | null;
    },
    public loyalityPoints: number | null,
    public isBlocked: boolean | null,
    public role: string,
    public createdAt: Date,
    public updatedAt: Date,
  ) {}
}
