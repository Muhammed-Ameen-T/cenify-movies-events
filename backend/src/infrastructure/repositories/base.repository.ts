import { Model, Document, FilterQuery } from 'mongoose';

export abstract class BaseRepository<T extends Document> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  // 🔹 Create a new document
  async create(data: Partial<T>): Promise<T> {
    return await this.model.create(data);
  }

  // 🔹 Find by ID
  async findById(id: string): Promise<T | null> {
    return await this.model.findById(id);
  }

  // 🔹 Find one by query
  async findOne(query: FilterQuery<T>): Promise<T | null> {
    return await this.model.findOne(query).exec();
  }

  // 🔹 Find multiple by query
  async findMany(query: FilterQuery<T>): Promise<T[]> {
    return await this.model.find(query).exec();
  }

  // 🔹 Update a document by ID
  async update(id: string, data: Partial<T>): Promise<T | null> {
    return await this.model.findByIdAndUpdate(id, data, { new: true });
  }

  // 🔹 Delete a document by ID
  async delete(id: string): Promise<T | null> {
    return await this.model.findByIdAndDelete(id);
  }

  // 🔹 Count documents based on query
  async count(query: FilterQuery<T>): Promise<number> {
    return await this.model.countDocuments(query).exec();
  }
}
