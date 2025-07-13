import mongoose, { Schema, Document, ObjectId } from 'mongoose';
import { IMovie } from '../../domain/interfaces/model/movie.interface';

const movieSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    genre: [{ type: String, required: true }],
    trailer: { type: String, required: true },
    rating: { type: Number, required: true },
    poster: { type: String, required: true },
    duration: {
      hours: { type: Number, required: true },
      minutes: { type: Number, required: true },
      seconds: { type: Number, default: 0 },
    },
    description: { type: String, required: true },
    language: { type: String, required: true },
    releaseDate: { type: Date, required: true },
    status: { type: String, required: true, default: 'upcoming' },
    likes: { type: Number, default: 0 },
    likedBy: [{ type: Schema.Types.ObjectId, required: true }],
    is3D: { type: Boolean, default: false },
    crew: [
      {
        id: { type: String },
        name: { type: String },
        role: { type: String },
        profileImage: { type: String },
      },
    ],
    cast: [
      {
        id: { type: String },
        name: { type: String },
        as: { type: String },
        profileImage: { type: String },
      },
    ],
    reviews: [
      {
        comment: { type: String },
        createdAt: { type: Date },
        rating: { type: String },
        likes: { type: Number },
        userId: { type: Schema.Types.ObjectId },
      },
    ],
  },
  { timestamps: true },
);

const MovieModel = mongoose.model<IMovie>('Movie', movieSchema);

export default MovieModel;
