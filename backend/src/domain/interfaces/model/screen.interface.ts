import mongoose, { Schema, Document, ObjectId } from 'mongoose';

export interface IScreen extends Document {
  _id: ObjectId;
  theaterId: ObjectId | null;
  name: string | null;
  seatingCapacity: number | null;
  seatLayout: {
    rows: {
      rowId: string | null;
      seats: {
        price: string | null;
        seatNumber: string | null;
        type: string | null;
      }[];
      type: string | null;
    }[];
  };
  seatRate: {
    premium: number | null;
    regular: number | null;
    vip: number | null;
  };
  filledTimes: {
    startTime: Date | null;
    endTime: Date | null;
    showId: ObjectId | null;
  }[];
  amenities: {
    is3D: boolean | null;
    is4K: boolean | null;
    isDolby: boolean | null;
  };
}