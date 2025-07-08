import { Document, ObjectId, Types } from 'mongoose';

export interface IMoviePass extends Document {
  _id: ObjectId;
  userId: Types.ObjectId;
  status: 'Active' | 'Inactive';
  history: { title: string; date: Date; saved: number }[];
  purchaseDate: Date;
  expireDate: Date;
  moneySaved: number;
  totalMovies: number;
}
