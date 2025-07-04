import mongoose, { ObjectId } from 'mongoose';

export class Theater {
  constructor(
    public _id: string,
    public screens: string[] | null,
    public name: string,
    public status: string,
    public location: {
      city: string | null;
      coordinates: number[] | null;
      type: string | null;
    } | null,
    public facilities: {
      foodCourt: boolean | null;
      lounges: boolean | null;
      mTicket: boolean | null;
      parking: boolean | null;
      freeCancellation: boolean | null;
    } | null,
    public createdAt: Date | null,
    public updatedAt: Date | null,
    public intervalTime: number | null,
    public gallery: string[] | null,
    public email: string | null,
    public phone: number | null,
    public description: string | null,
    public vendorId: mongoose.Types.ObjectId,
    public rating: number | null,
    public ratingCount: number,
  ) {}

  isValidEmail(): boolean {
    return this.email ? /\S+@\S+\.\S+/.test(this.email) : false;
  }
}
