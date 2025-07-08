import mongoose, { Schema, Document, ObjectId, Types } from 'mongoose';

export interface INotification extends Document {
  _id: ObjectId;
  userId: Types.ObjectId | null;
  title: string;
  type: string;
  description: string;
  bookingId?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
  isRead: boolean;
  isGlobal: boolean;
  readedUsers: Types.ObjectId[];
}
