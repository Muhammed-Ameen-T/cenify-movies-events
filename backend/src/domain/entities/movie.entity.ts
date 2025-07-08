import { ObjectId, Types } from 'mongoose';
import { ICast, ICrew, IDuration, IMovie, IReview } from '../interfaces/model/movie.interface';

export class Movie {
  constructor(
    public _id: ObjectId | string,
    public name: string,
    public genre: string[],
    public trailer: string,
    public rating: number,
    public poster: string,
    public duration: IDuration,
    public description: string,
    public language: string,
    public releaseDate: Date,
    public status: string,
    public likes?: number,
    public likedBy?: Types.ObjectId[],
    public is3D?: boolean,
    public crew?: ICrew[],
    public cast?: ICast[],
    public reviews?: IReview[],
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}
}
