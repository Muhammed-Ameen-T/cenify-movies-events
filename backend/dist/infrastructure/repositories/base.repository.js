"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
class BaseRepository {
    constructor(model) {
        this.model = model;
    }
    // 🔹 Create a new document
    async create(data) {
        return await this.model.create(data);
    }
    // 🔹 Find by ID
    async findById(id) {
        return await this.model.findById(id);
    }
    // 🔹 Find one by query
    async findOne(query) {
        return await this.model.findOne(query).exec();
    }
    // 🔹 Find multiple by query
    async findMany(query) {
        return await this.model.find(query).exec();
    }
    // 🔹 Update a document by ID
    async update(id, data) {
        return await this.model.findByIdAndUpdate(id, data, { new: true });
    }
    // 🔹 Delete a document by ID
    async delete(id) {
        return await this.model.findByIdAndDelete(id);
    }
    // 🔹 Count documents based on query
    async count(query) {
        return await this.model.countDocuments(query).exec();
    }
}
exports.BaseRepository = BaseRepository;
