import { injectable } from 'tsyringe';
import mongoose from 'mongoose';
import MoviePassModel from '../database/moviePass.model';
import { IMoviePassRepository } from '../../domain/interfaces/repositories/moviePass.repository';
import { MoviePass, MoviePassHistory } from '../../domain/entities/moviePass.entity';
import { CustomError } from '../../utils/errors/custom.error';
import { HttpResCode } from '../../utils/constants/httpResponseCode.utils';
import ERROR_MESSAGES from '../../utils/constants/commonErrorMsg.constants';

@injectable()
export class MoviePassRepository implements IMoviePassRepository {
  private model = MoviePassModel;

  async create(moviePass: MoviePass): Promise<MoviePass> {
    const newMoviePass = new this.model({
      userId: moviePass.userId,
      status: moviePass.status,
      history: moviePass.history,
      purchaseDate: moviePass.purchaseDate,
      expireDate: moviePass.expireDate,
      moneySaved: moviePass.moneySaved,
      totalMovies: moviePass.totalMovies,
    });

    const savedDoc = await newMoviePass.save();
    return this.mapToEntity(savedDoc);
  }

  async findByUserId(userId: string): Promise<MoviePass | null> {
    const doc = await this.model.findOne({ userId }).lean();
    if (!doc) return null;
    return this.mapToEntity(doc);
  }

  async updateStatus(userId: string, status: 'Active' | 'Inactive'): Promise<MoviePass | null> {
    const doc = await this.model.findOneAndUpdate({ userId }, { status }, { new: true }).lean();
    if (!doc) return null;
    return this.mapToEntity(doc);
  }

  async update(userId: string, updates: Partial<MoviePass>): Promise<MoviePass | null> {
    const doc = await this.model
      .findOneAndUpdate({ userId }, { $set: updates }, { new: true })
      .lean();
    return doc ? this.mapToEntity(doc) : null;
  }

  async incrementMovieStats(userId: string, newSaving: number): Promise<MoviePass | null> {
    const update = {
      $inc: {
        totalMovies: 1,
        moneySaved: newSaving,
      },
      $push: {
        history: {
          title: 'New Movie Booked using movie pass',
          date: new Date(),
          saved: newSaving,
        },
      },
    };

    const updatedDoc = await this.model.findOneAndUpdate({ userId }, update, { new: true }).lean();

    return updatedDoc ? this.mapToEntity(updatedDoc) : null;
  }

  async findHistoryByUserId(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{
    history: MoviePassHistory[];
    total: number;
  }> {
    try {
      // Validate userId
      let objectId;
      try {
        objectId = new mongoose.Types.ObjectId(userId);
      } catch (error) {
        console.error('❌ Invalid userId format:', userId);
        throw new CustomError('Invalid user ID format', HttpResCode.BAD_REQUEST);
      }

      // Validate pagination parameters
      if (page < 1 || limit < 1) {
        throw new CustomError('Invalid pagination parameters', HttpResCode.BAD_REQUEST);
      }

      // Check if movie pass exists
      const moviePass = await this.model.findOne({ userId: objectId }).lean();
      if (!moviePass) {
        return { history: [], total: 0 };
      }

      // Check if history array is empty
      if (!moviePass.history || moviePass.history.length === 0) {
        return { history: [], total: 0 };
      }

      // Aggregation pipeline for paginated history
      const result = await this.model
        .aggregate([
          { $match: { userId: objectId } },
          { $unwind: '$history' },
          { $sort: { 'history.date': -1 } },
          { $skip: (page - 1) * limit },
          { $limit: limit },
          {
            $group: {
              _id: '$_id',
              history: { $push: '$history' },
              total: { $sum: 1 },
            },
          },
          {
            $project: {
              history: 1,
              total: { $size: '$history' },
            },
          },
        ])
        .exec();

      const history =
        result[0]?.history?.map((h: any) => ({
          title: h.title,
          date: h.date,
          saved: h.saved,
        })) || [];

      // Get total history count
      const totalCountResult = await this.model
        .aggregate([
          { $match: { userId: objectId } },
          { $project: { total: { $size: '$history' } } },
        ])
        .exec();

      const total = totalCountResult[0]?.total || 0;

      return { history, total };
    } catch (error) {
      console.error('❌ Error finding movie pass history by user ID:', error);
      throw new CustomError(
        ERROR_MESSAGES.GENERAL.FAILED_FINDING_MOVIE_PASS,
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private mapToEntity(doc: any): MoviePass {
    return new MoviePass(
      doc._id.toString(),
      doc.userId.toString(),
      doc.status,
      doc.history.map((h: any) => ({
        title: h.title,
        date: h.date,
        saved: h.saved,
      })),
      doc.purchaseDate,
      doc.expireDate,
      doc.moneySaved,
      doc.totalMovies,
      doc.createdAt,
      doc.updatedAt,
    );
  }
}
