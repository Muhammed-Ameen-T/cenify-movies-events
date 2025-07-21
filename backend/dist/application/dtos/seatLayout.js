"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSeatLayoutDTOSchema = exports.UpdateSeatLayoutDTO = exports.CreateSeatLayoutDTO = exports.CreateSeatLayoutDTOSchema = void 0;
// src/application/dtos/seatLayout.ts
const mongoose_1 = __importDefault(require("mongoose"));
const zod_1 = require("zod");
// Define the seat price schema
const SeatPriceSchema = zod_1.z.object({
    regular: zod_1.z.number().positive(),
    premium: zod_1.z.number().positive(),
    vip: zod_1.z.number().positive(),
});
// Define the seat schema
const SeatSchema = zod_1.z.object({
    uuid: zod_1.z.string().uuid(),
    type: zod_1.z.enum(['Regular', 'Premium', 'VIP', 'Unavailable']),
    position: zod_1.z.object({
        row: zod_1.z.number().nonnegative(),
        col: zod_1.z.number().nonnegative(),
    }),
    number: zod_1.z.string().min(1),
    price: zod_1.z.number().nonnegative().optional(),
});
// Define the CreateSeatLayoutDTO schema
exports.CreateSeatLayoutDTOSchema = zod_1.z.object({
    uuid: zod_1.z.string().uuid({ message: 'Invalid UUID format' }),
    vendorId: zod_1.z.string().min(1, { message: 'Vendor ID cannot be empty' }),
    layoutName: zod_1.z.string().min(1, { message: 'Layout name cannot be empty' }),
    seatPrice: SeatPriceSchema,
    rowCount: zod_1.z.number().positive({ message: 'Row count must be a positive number' }),
    columnCount: zod_1.z.number().positive({ message: 'Column count must be a positive number' }),
    capacity: zod_1.z.number().nonnegative({ message: 'Capacity cannot be negative' }),
    seats: zod_1.z.array(SeatSchema).min(1, { message: 'At least one seat must be provided' }),
});
// Update the class to match the schema
class CreateSeatLayoutDTO {
    constructor(uuid, vendorId, layoutName, seatPrice, rowCount, columnCount, seats, capacity) {
        this.uuid = uuid;
        this.vendorId = vendorId;
        this.layoutName = layoutName;
        this.seatPrice = seatPrice;
        this.rowCount = rowCount;
        this.columnCount = columnCount;
        this.seats = seats;
        this.capacity = capacity;
    }
}
exports.CreateSeatLayoutDTO = CreateSeatLayoutDTO;
class UpdateSeatLayoutDTO {
    constructor(layoutId, uuid, layoutName, seatPrice, rowCount, columnCount, seats, capacity) {
        this.layoutId = layoutId;
        this.uuid = uuid;
        this.layoutName = layoutName;
        this.seatPrice = seatPrice;
        this.rowCount = rowCount;
        this.columnCount = columnCount;
        this.seats = seats;
        this.capacity = capacity;
    }
}
exports.UpdateSeatLayoutDTO = UpdateSeatLayoutDTO;
exports.UpdateSeatLayoutDTOSchema = zod_1.z.object({
    layoutId: zod_1.z.string().refine((id) => mongoose_1.default.Types.ObjectId.isValid(id), {
        message: 'Invalid layout ID',
    }),
    uuid: zod_1.z.string().uuid(),
    layoutName: zod_1.z.string().min(1, 'Layout name is required'),
    seatPrice: zod_1.z.object({
        regular: zod_1.z.number().positive('Regular price must be positive'),
        premium: zod_1.z.number().positive('Premium price must be positive'),
        vip: zod_1.z.number().positive('VIP price must be positive'),
    }),
    capacity: zod_1.z.number().int().positive('Capacity must be positive'),
    rowCount: zod_1.z.number().int().positive('Row count must be positive'),
    columnCount: zod_1.z.number().int().positive('Column count must be positive'),
    seats: zod_1.z.array(zod_1.z.object({
        uuid: zod_1.z.string().uuid(),
        number: zod_1.z.string().min(1, 'Seat number is required'),
        type: zod_1.z.enum(['Regular', 'Premium', 'VIP', 'Unavailable']),
        position: zod_1.z.object({
            row: zod_1.z.number().int().nonnegative('Row must be non-negative'),
            col: zod_1.z.number().int().nonnegative('Column must be non-negative'),
        }),
        price: zod_1.z.number().optional(), // Optional, will be set based on seat type
    })),
});
