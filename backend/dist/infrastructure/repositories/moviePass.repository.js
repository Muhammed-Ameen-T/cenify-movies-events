"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoviePassRepository = void 0;
const tsyringe_1 = require("tsyringe");
const mongoose_1 = __importDefault(require("mongoose"));
const moviePass_model_1 = __importDefault(require("../database/moviePass.model"));
const moviePass_entity_1 = require("../../domain/entities/moviePass.entity");
const custom_error_1 = require("../../utils/errors/custom.error");
const httpResponseCode_utils_1 = require("../../utils/constants/httpResponseCode.utils");
const commonErrorMsg_constants_1 = __importDefault(require("../../utils/constants/commonErrorMsg.constants"));
let MoviePassRepository = class MoviePassRepository {
    constructor() {
        this.model = moviePass_model_1.default;
    }
    async create(moviePass) {
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
    async findByUserId(userId) {
        const doc = await this.model.findOne({ userId }).lean();
        if (!doc)
            return null;
        return this.mapToEntity(doc);
    }
    async updateStatus(userId, status) {
        const doc = await this.model.findOneAndUpdate({ userId }, { status }, { new: true }).lean();
        if (!doc)
            return null;
        return this.mapToEntity(doc);
    }
    async update(userId, updates) {
        try {
            // Prefer updates.userId for consistency
            const resolvedUserId = updates.userId;
            const userObjectId = new mongoose_1.default.Types.ObjectId(resolvedUserId);
            const { status, history, purchaseDate, expireDate, moneySaved, totalMovies } = updates;
            const updatePayload = {
                status,
                history,
                purchaseDate,
                expireDate,
                moneySaved,
                totalMovies,
            };
            const doc = await this.model
                .findOneAndUpdate({ userId: userObjectId }, { $set: updatePayload }, { new: true, upsert: true })
                .lean();
            return doc ? this.mapToEntity(doc) : null;
        }
        catch (error) {
            console.error(`Error updating MoviePass for user ${userId}:`, error);
            return null;
        }
    }
    async incrementMovieStats(userId, newSaving) {
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
    async findHistoryByUserId(userId, page, limit) {
        try {
            // Validate userId
            let objectId;
            try {
                objectId = new mongoose_1.default.Types.ObjectId(userId);
            }
            catch (error) {
                console.error('❌ Invalid userId format:', userId);
                throw new custom_error_1.CustomError('Invalid user ID format', httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            // Validate pagination parameters
            if (page < 1 || limit < 1) {
                throw new custom_error_1.CustomError('Invalid pagination parameters', httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
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
            const history = result[0]?.history?.map((h) => ({
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
        }
        catch (error) {
            console.error('❌ Error finding movie pass history by user ID:', error);
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.GENERAL.FAILED_FINDING_MOVIE_PASS, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
    }
    mapToEntity(doc) {
        return new moviePass_entity_1.MoviePass(doc._id.toString(), doc.userId.toString(), doc.status, doc.history.map((h) => ({
            title: h.title,
            date: h.date,
            saved: h.saved,
        })), doc.purchaseDate, doc.expireDate, doc.moneySaved, doc.totalMovies, doc.createdAt, doc.updatedAt);
    }
};
exports.MoviePassRepository = MoviePassRepository;
exports.MoviePassRepository = MoviePassRepository = __decorate([
    (0, tsyringe_1.injectable)()
], MoviePassRepository);
