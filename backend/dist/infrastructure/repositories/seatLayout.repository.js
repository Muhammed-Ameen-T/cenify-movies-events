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
exports.SeatLayoutRepository = void 0;
// src/infrastructure/database/seatLayout.repository.ts
const tsyringe_1 = require("tsyringe");
const mongoose_1 = __importDefault(require("mongoose"));
const seatLayout_model_1 = __importDefault(require("../database/seatLayout.model"));
const seat_model_1 = __importDefault(require("../database/seat.model"));
const seatLayout_entity_1 = require("../../domain/entities/seatLayout.entity");
const custom_error_1 = require("../../utils/errors/custom.error");
let SeatLayoutRepository = class SeatLayoutRepository {
    mapToEntity(seatLayout) {
        return new seatLayout_entity_1.SeatLayout(seatLayout._id, seatLayout.uuid, seatLayout.vendorId, seatLayout.layoutName, seatLayout.seatPrice, seatLayout.capacity, 
        // Handle populated seats or ObjectId
        seatLayout.seatIds.map((seat) => seat._id && seat.number ? this.mapSeatToEntity(seat) : seat), seatLayout.rowCount, seatLayout.columnCount, seatLayout.createdAt, seatLayout.updatedAt);
    }
    mapSeatToEntity(seat) {
        return new seatLayout_entity_1.Seat(seat._id || null, seat.uuid, seat.seatLayoutId, seat.number, seat.type, seat.price, seat.position);
    }
    async findByVendor(params) {
        try {
            const { vendorId, page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc', } = params;
            const query = { vendorId: new mongoose_1.default.Types.ObjectId(vendorId) };
            if (search) {
                query.layoutName = { $regex: search, $options: 'i' };
            }
            const skip = (page - 1) * limit;
            const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
            const [seatLayouts, totalCount] = await Promise.all([
                seatLayout_model_1.default.find(query).sort(sort).skip(skip).limit(limit).lean(),
                seatLayout_model_1.default.countDocuments(query),
            ]);
            return {
                seatLayouts: seatLayouts.map((doc) => this.mapToEntity(doc)),
                totalCount,
            };
        }
        catch (error) {
            console.error('❌ Error fetching seat layouts:', error);
            throw new custom_error_1.CustomError('Failed to fetch seat layouts', 500);
        }
    }
    async create(seatLayout) {
        try {
            const { uuid, vendorId, layoutName, seatPrice, capacity, seatIds, rowCount, columnCount, createdAt, updatedAt, } = seatLayout;
            // Convert Seat[] to ObjectId[]
            const mappedSeatIds = Array.isArray(seatIds)
                ? seatIds
                    .map((seat) => (seat instanceof seatLayout_entity_1.Seat && seat._id ? seat._id : seat))
                    .filter((id) => id instanceof mongoose_1.default.Types.ObjectId)
                : [];
            const seatLayoutDoc = await seatLayout_model_1.default.findOneAndUpdate({ uuid }, {
                $set: {
                    vendorId,
                    layoutName,
                    seatPrice,
                    capacity,
                    seatIds: mappedSeatIds,
                    rowCount,
                    columnCount,
                    createdAt,
                    updatedAt,
                },
            }, { upsert: true, new: true });
            return this.mapToEntity(seatLayoutDoc);
        }
        catch (error) {
            console.error('🚖 Error creating seat layout:', error);
            throw new custom_error_1.CustomError('Error creating seat layout', 500);
        }
    }
    async update(seatLayout) {
        try {
            // Convert Seat[] to ObjectId[]
            const seatIds = Array.isArray(seatLayout.seatIds)
                ? seatLayout.seatIds
                    .map((seat) => (seat instanceof seatLayout_entity_1.Seat && seat._id ? seat._id : seat))
                    .filter((id) => id instanceof mongoose_1.default.Types.ObjectId)
                : [];
            const seatLayoutDoc = await seatLayout_model_1.default.findByIdAndUpdate(seatLayout._id, {
                $set: {
                    uuid: seatLayout.uuid,
                    layoutName: seatLayout.layoutName,
                    seatPrice: seatLayout.seatPrice,
                    capacity: seatLayout.capacity,
                    seatIds,
                    rowCount: seatLayout.rowCount,
                    columnCount: seatLayout.columnCount,
                    updatedAt: new Date(),
                },
            }, { new: true });
            if (!seatLayoutDoc) {
                throw new custom_error_1.CustomError('Seat layout not found', 404);
            }
            return this.mapToEntity(seatLayoutDoc);
        }
        catch (error) {
            console.error('🚖 Error updating seat layout:', error);
            if (error instanceof custom_error_1.CustomError) {
                throw error;
            }
            throw new custom_error_1.CustomError('Error updating seat layout', 500);
        }
    }
    async createSeats(seats) {
        try {
            const uuids = seats.map((seat) => seat.uuid);
            const existingSeats = await seat_model_1.default.find({ uuid: { $in: uuids } }).select('uuid');
            const existingUuids = new Set(existingSeats.map((seat) => seat.uuid));
            const newSeats = seats.filter((seat) => !existingUuids.has(seat.uuid));
            if (newSeats.length === 0) {
                throw new custom_error_1.CustomError('All provided seat UUIDs already exist', 400);
            }
            if (newSeats.length < seats.length) {
                console.warn(`Skipped ${seats.length - newSeats.length} seats with duplicate UUIDs`);
            }
            const seatDocs = await seat_model_1.default.insertMany(newSeats.map((seat) => ({
                uuid: seat.uuid,
                seatLayoutId: seat.seatLayoutId,
                number: seat.number,
                type: seat.type,
                price: seat.price,
                position: seat.position,
            })), { ordered: false });
            return seatDocs.map((doc) => this.mapSeatToEntity(doc));
        }
        catch (error) {
            console.error('🚖 Error creating seats:', error);
            throw new custom_error_1.CustomError('Error creating seats', 500);
        }
    }
    async replaceSeats(seatLayoutId, seats) {
        try {
            await seat_model_1.default.deleteMany({ seatLayoutId });
            const seatDocs = await seat_model_1.default.insertMany(seats.map((seat) => ({
                uuid: seat.uuid,
                seatLayoutId: seat.seatLayoutId,
                number: seat.number,
                type: seat.type,
                price: seat.price,
                position: seat.position,
            })), { ordered: false });
            return seatDocs.map((doc) => this.mapSeatToEntity(doc));
        }
        catch (error) {
            console.error('🚖 Error replacing seats:', error);
            throw new custom_error_1.CustomError('Error replacing seats', 500);
        }
    }
    async findById(id) {
        try {
            // if (!mongoose.Types.ObjectId.isValid(id)) {
            //   throw new CustomError('Invalid seat layout ID', 400);
            // }
            const seatLayoutDoc = await seatLayout_model_1.default.findById(id)
                .populate({
                path: 'seatIds',
                model: 'Seat',
                select: 'uuid number type price position',
            })
                .lean();
            if (!seatLayoutDoc) {
                return null;
            }
            const mappedSeatLayout = {
                ...seatLayoutDoc,
                seatIds: seatLayoutDoc.seatIds.map((seat) => this.mapSeatToEntity(seat)),
            };
            return this.mapToEntity(mappedSeatLayout);
        }
        catch (error) {
            console.error('🚖 Error fetching seat layout by ID:', error);
            if (error instanceof custom_error_1.CustomError) {
                throw error;
            }
            throw new custom_error_1.CustomError('Error fetching seat layout by ID', 500);
        }
    }
};
exports.SeatLayoutRepository = SeatLayoutRepository;
exports.SeatLayoutRepository = SeatLayoutRepository = __decorate([
    (0, tsyringe_1.injectable)()
], SeatLayoutRepository);
