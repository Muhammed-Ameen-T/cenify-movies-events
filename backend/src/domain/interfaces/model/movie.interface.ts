import { ObjectId, Types } from 'mongoose';

export interface IDuration {
  hours: number;
  minutes: number;
  seconds: number;
}

export interface IReview {
  comment?: string;
  createdAt?: Date;
  rating?: number;
  likes?: number;
  userId?: ObjectId;
}

export interface ICrew {
  id?: string;
  name?: string;
  role?: string;
  profileImage?: string;
}

export interface ICast {
  id?: string;
  name?: string;
  as?: string;
  profileImage?: string;
}

export interface IMovie extends Document {
  _id: ObjectId;
  name: string;
  genre: string[];
  trailer?: string;
  rating: number;
  poster: string;
  duration: IDuration;
  description: string;
  language: string;
  releaseDate: Date;
  status: string;
  likes?: number;
  likedBy?: Types.ObjectId[];
  is3D?: boolean;
  crew?: ICrew[];
  cast?: ICast[];
  reviews?: IReview[];
  createdAt?: Date;
  updatedAt?: Date;
}
