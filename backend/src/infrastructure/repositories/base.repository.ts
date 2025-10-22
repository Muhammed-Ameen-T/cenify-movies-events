// src/infrastructure/repositories/base.repository.ts
import {
  Document,
  Model,
  FilterQuery,
  UpdateQuery,
  DeleteResult,
  Types,
  UpdateWriteOpResult,
  Query,
} from 'mongoose';

/**
 * Abstract base class for repositories to provide common Mongoose operations.
 * @template T - The Mongoose Document type.
 */
export abstract class BaseRepository<T extends Document> {
  constructor(protected model: Model<T>) {} // --- FIND Methods ---
  /**
   * Finds a document by its Mongoose ObjectId.
   * Renamed from 'findById' to avoid conflict with specific child repository methods.
   */

  protected async _findByIdObject(id: Types.ObjectId): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    return this.model.findOne(filter).sort({ createdAt: -1 }).exec();
  }

  async findAll(): Promise<T[]> {
    return this.model.find().exec();
  } // Return Mongoose Query object for chaining (e.g., sorting, limiting)

  find(filter: FilterQuery<T>): Query<T[], T> {
    return this.model.find(filter);
  } // --- CREATE Methods ---
  /**
   * Creates a new document. Renamed from 'create' to avoid conflict with child entity methods.
   */

  async createDoc(data: Partial<Omit<T, '_id'>>): Promise<T> {
    const document = new this.model(data);
    return document.save();
  } // --- UPDATE Methods ---
  /**
   * Updates a document by ObjectId. Renamed from 'update' to avoid conflict with child entity methods.
   */

  async updateDoc(id: Types.ObjectId, data: Partial<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async updateOne(filter: FilterQuery<T>, update: UpdateQuery<T>): Promise<UpdateWriteOpResult> {
    return this.model.updateOne(filter, update).exec();
  } // --- DELETE Methods ---

  async delete(id: Types.ObjectId): Promise<T | null> {
    return this.model.findByIdAndDelete(id).exec();
  }

  async deleteOne(filter: FilterQuery<T>): Promise<DeleteResult> {
    return this.model.deleteOne(filter).exec();
  }
}
