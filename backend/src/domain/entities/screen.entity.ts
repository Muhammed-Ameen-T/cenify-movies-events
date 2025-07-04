import mongoose, { ObjectId, Types } from 'mongoose';

export class Screen {
  constructor(
    public _id: string,
    public name: string | null,
    public theaterId: Types.ObjectId | null,
    public seatLayoutId: Types.ObjectId | null,
    public filledTimes:
      | {
          startTime: Date | null;
          endTime: Date | null;
          showId: Types.ObjectId | null;
        }[]
      | null,
    public amenities: {
      is3D: boolean;
      is4K: boolean;
      isDolby: boolean;
    },
    public createdAt: Date | null = null,
    public updatedAt: Date | null = null,
  ) {}
}
