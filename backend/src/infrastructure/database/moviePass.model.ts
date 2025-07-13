import mongoose, { Schema } from 'mongoose';
import { IMoviePass } from '../../domain/interfaces/model/moviePass.interface';

const MoviePassSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    status: { type: String, enum: ['Active', 'Inactive'], required: true },
    history: [
      {
        title: { type: String, required: true },
        date: { type: Date, required: true },
        saved: { type: Number, required: true },
      },
    ],
    purchaseDate: { type: Date, required: true },
    expireDate: { type: Date, required: true },
    moneySaved: { type: Number, required: true },
    totalMovies: { type: Number, required: true },
  },
  { timestamps: true },
);

const MoviePassModel = mongoose.model<IMoviePass>('MoviePass', MoviePassSchema);

export default MoviePassModel;
