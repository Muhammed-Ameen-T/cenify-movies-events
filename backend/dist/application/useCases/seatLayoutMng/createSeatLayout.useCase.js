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
exports.CreateSeatLayoutUseCase = void 0;
// src/application/useCases/Vendor/createSeatLayout.useCase.ts
const tsyringe_1 = require("tsyringe");
const mongoose_1 = __importDefault(require("mongoose"));
const sendResponse_utils_1 = require("../../../utils/response/sendResponse.utils");
const httpResponseCode_utils_1 = require("../../../utils/constants/httpResponseCode.utils");
const custom_error_1 = require("../../../utils/errors/custom.error");
const commonSuccessMsg_constants_1 = require("../../../utils/constants/commonSuccessMsg.constants");
const commonErrorMsg_constants_1 = __importDefault(require("../../../utils/constants/commonErrorMsg.constants"));
const zod_1 = require("zod");
const seatLayout_entity_1 = require("../../../domain/entities/seatLayout.entity");
const seatLayout_1 = require("../../dtos/seatLayout");
const seatLayout_model_1 = __importDefault(require("../../../infrastructure/database/seatLayout.model"));
// Utility function to normalize seat types
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
let CreateSeatLayoutUseCase = class CreateSeatLayoutUseCase {
    constructor(seatLayoutRepository) {
        this.seatLayoutRepository = seatLayoutRepository;
    }
    async execute(dto, res) {
        try {
            const normalizedDto = {
                ...dto,
                seats: dto.seats.map((seat) => ({
                    ...seat,
                    type: normalizeSeatType(seat.type),
                })),
            };
            const validatedData = seatLayout_1.CreateSeatLayoutDTOSchema.parse(normalizedDto);
            if (!mongoose_1.default.Types.ObjectId.isValid(validatedData.vendorId)) {
                (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST, commonErrorMsg_constants_1.default.VALIDATION.INVALID_VENDOR_ID);
                return;
            }
            const capacity = validatedData.seats.filter((seat) => seat.type !== 'Unavailable').length;
            if (capacity !== validatedData.capacity) {
                throw new custom_error_1.CustomError(`Capacity mismatch: expected ${capacity}, got ${validatedData.capacity}`, 400);
            }
            // Validate seat count
            if (validatedData.seats.length !== validatedData.rowCount * validatedData.columnCount) {
                throw new custom_error_1.CustomError(`Seat count mismatch: expected ${validatedData.rowCount * validatedData.columnCount}, got ${validatedData.seats.length}`, 400);
            }
            // Create SeatLayout entity
            const seatLayout = new seatLayout_entity_1.SeatLayout(null, validatedData.uuid, new mongoose_1.default.Types.ObjectId(validatedData.vendorId), validatedData.layoutName, validatedData.seatPrice, capacity, [], validatedData.rowCount, validatedData.columnCount, new Date(), new Date());
            // Create or update SeatLayout document
            const savedSeatLayout = await this.seatLayoutRepository.create(seatLayout);
            if (!savedSeatLayout._id) {
                throw new custom_error_1.CustomError('Failed to create or update seat layout', 500);
            }
            // Map seats with correct seatLayoutId
            const seats = validatedData.seats.map((seat) => {
                const normalizedType = seat.type.toLowerCase();
                const type = seat.type;
                const price = normalizedType === 'unavailable'
                    ? 0
                    : validatedData.seatPrice[normalizedType];
                if (price === undefined) {
                    throw new custom_error_1.CustomError(`Invalid price for seat type: ${seat.type}`, 400);
                }
                return new seatLayout_entity_1.Seat(null, seat.uuid, savedSeatLayout._id, seat.number, type, price, {
                    row: seat.position.row,
                    col: seat.position.col,
                });
            });
            // Create Seat documents
            const savedSeats = await this.seatLayoutRepository.createSeats(seats);
            seatLayout.seatIds = savedSeats.map((seat) => seat._id);
            // Update SeatLayout with seatIds
            await seatLayout_model_1.default.updateOne({ _id: savedSeatLayout._id }, { seatIds: seatLayout.seatIds });
            // Prepare response
            const responseData = {
                _id: savedSeatLayout._id,
                uuid: savedSeatLayout.uuid,
                vendorId: savedSeatLayout.vendorId,
                layoutName: savedSeatLayout.layoutName,
                seatPrice: savedSeatLayout.seatPrice,
                capacity: savedSeatLayout.capacity,
                seatIds: savedSeatLayout.seatIds,
                rowCount: savedSeatLayout.rowCount,
                columnCount: savedSeatLayout.columnCount,
                createdAt: savedSeatLayout.createdAt,
                updatedAt: savedSeatLayout.updatedAt,
                createdSeats: savedSeats.length,
                skippedSeats: validatedData.seats.length - savedSeats.length,
            };
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, commonSuccessMsg_constants_1.SuccessMsg.SEAT_LAYOUT_CREATED, responseData);
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST, error.errors.map((e) => e.message).join(', '));
                return;
            }
            const errorMessage = error instanceof custom_error_1.CustomError ? error.message : 'Failed to create seat layout';
            (0, sendResponse_utils_1.sendResponse)(res, error instanceof custom_error_1.CustomError ? error.statusCode : httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR, errorMessage);
        }
    }
};
exports.CreateSeatLayoutUseCase = CreateSeatLayoutUseCase;
exports.CreateSeatLayoutUseCase = CreateSeatLayoutUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('SeatLayoutRepository')),
    __metadata("design:paramtypes", [Object])
], CreateSeatLayoutUseCase);
