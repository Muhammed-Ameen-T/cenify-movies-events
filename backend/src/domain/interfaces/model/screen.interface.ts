import { Document, ObjectId, Types } from 'mongoose';

export interface IScreen extends Document {
  _id: ObjectId;
  name: string | null;
  theaterId: Types.ObjectId | null;
  seatLayoutId: Types.ObjectId | null;
  filledTimes: {
    startTime: Date | null;
    endTime: Date | null;
    showId: Types.ObjectId | null;
  }[];
  amenities: {
    is3D: boolean;
    is4K: boolean;
    isDolby: boolean;
  };
}
