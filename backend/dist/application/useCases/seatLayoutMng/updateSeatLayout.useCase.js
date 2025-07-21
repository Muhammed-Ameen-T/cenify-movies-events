"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSeatLayoutUseCase = void 0;
// src/application/useCases/Vendor/updateSeatLayout.useCase.ts
const tsyringe_1 = require("tsyringe");
const mongoose_1 = __importDefault(require("mongoose"));
const sendResponse_utils_1 = require("../../../utils/response/sendResponse.utils");
const httpResponseCode_utils_1 = require("../../../utils/constants/httpResponseCode.utils");
const custom_error_1 = require("../../../utils/errors/custom.error");
const commonErrorMsg_constants_1 = __importDefault(require("../../../utils/constants/commonErrorMsg.constants"));
const zod_1 = require("zod");
const seatLayout_entity_1 = require("../../../domain/entities/seatLayout.entity");
const seatLayout_1 = require("../../dtos/seatLayout");
const seatLayout_model_1 = __importDefault(require("../../../infrastructure/database/seatLayout.model"));
// Utility function to normalize seat types (reused from create use case)
const normalizeSeatType = (type) => {
    const normalized = type.toLowerCase();
    switch (normalized) {
        case 'regular':
            return 'Regular';
        case 'premium':
            return 'Premium';
        case 'vip':
            return 'VIP';
        case 'unavailable':
            return 'Unavailable';
        default:
            throw new custom_error_1.CustomError(`Invalid seat type: ${type}`, 400);
    }
};
let UpdateSeatLayoutUseCase = class UpdateSeatLayoutUseCase {
    constructor(seatLayoutRepository) {
        this.seatLayoutRepository = seatLayoutRepository;
    }
    async execute(dto, res) {
        try {
            // Normalize seat types
            const normalizedDto = {
                ...dto,
                seats: dto.seats.map((seat) => ({
                    ...seat,
                    type: normalizeSeatType(seat.type),
                })),
            };
            // Validate DTO
            const validatedData = seatLayout_1.UpdateSeatLayoutDTOSchema.parse(normalizedDto);
            // Validate layoutId
            if (!mongoose_1.default.Types.ObjectId.isValid(validatedData.layoutId)) {
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.INVALID_LAYOUT_ID, 400);
            }
            // Check if seat layout exists
            const existingLayout = await seatLayout_model_1.default.findById(validatedData.layoutId);
            if (!existingLayout) {
                throw new custom_error_1.CustomError('Seat layout not found', 404);
            }
            // Validate capacity
            const capacity = validatedData.seats.filter((seat) => seat.type !== 'Unavailable').length;
            if (capacity !== validatedData.capacity) {
                throw new custom_error_1.CustomError(`Capacity mismatch: expected ${capacity}, got ${validatedData.capacity}`, 400);
            }
            // Validate seat count
            if (validatedData.seats.length !== validatedData.rowCount * validatedData.columnCount) {
                throw new custom_error_1.CustomError(`Seat count mismatch: expected ${validatedData.rowCount * validatedData.columnCount}, got ${validatedData.seats.length}`, 400);
            }
            // Create SeatLayout entity for update
            const seatLayout = new seatLayout_entity_1.SeatLayout(new mongoose_1.default.Types.ObjectId(validatedData.layoutId), validatedData.uuid, existingLayout.vendorId, // Retain original vendorId
            validatedData.layoutName, validatedData.seatPrice, capacity, [], validatedData.rowCount, validatedData.columnCount, existingLayout.createdAt, new Date());
            // Map and validate seats
            const seats = validatedData.seats.map((seat) => {
                const normalizedType = seat.type.toLowerCase();
                const type = seat.type;
                const price = normalizedType === 'unavailable'
                    ? 0
                    : validatedData.seatPrice[normalizedType];
                if (price === undefined) {
                    throw new custom_error_1.CustomError(`Invalid price for seat type: ${seat.type}`, 400);
                }
                return new seatLayout_entity_1.Seat(null, // _id will be generated by MongoDB
                seat.uuid, new mongoose_1.default.Types.ObjectId(validatedData.layoutId), seat.number, type, price, {
                    row: seat.position.row,
                    col: seat.position.col,
                });
            });
            // Replace existing seats
            const savedSeats = await this.seatLayoutRepository.replaceSeats(new mongoose_1.default.Types.ObjectId(validatedData.layoutId), seats);
            seatLayout.seatIds = savedSeats.map((seat) => seat._id);
            // Update SeatLayout with new seatIds and other fields
            return await this.seatLayoutRepository.update(seatLayout);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                throw new custom_error_1.CustomError(`Validation error: ${error.errors.map((e) => e.message).join(', ')}`, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            const errorMessage = error instanceof custom_error_1.CustomError ? error.message : 'Failed to update seat layout';
            (0, sendResponse_utils_1.sendResponse)(res, error instanceof custom_error_1.CustomError ? error.statusCode : httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR, errorMessage);
            return null;
        }
    }
};
exports.UpdateSeatLayoutUseCase = UpdateSeatLayoutUseCase;
exports.UpdateSeatLayoutUseCase = UpdateSeatLayoutUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('SeatLayoutRepository')),
    __metadata("design:paramtypes", [Object])
], UpdateSeatLayoutUseCase);
