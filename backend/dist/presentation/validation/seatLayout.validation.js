"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSeatLayoutSchema = void 0;
const zod_1 = require("zod");
exports.createSeatLayoutSchema = zod_1.z.object({
    uuid: zod_1.z.string().uuid('Invalid layout UUID format'),
    vendorId: zod_1.z.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
        message: 'Invalid vendorId format',
    }),
    layoutName: zod_1.z.string().min(3, 'Layout name must be at least 3 characters'),
    seatPrice: zod_1.z.object({
        regular: zod_1.z.number().min(0, 'Regular seat price must be non-negative'),
        premium: zod_1.z.number().min(0, 'Premium seat price must be non-negative'),
        vip: zod_1.z.number().min(0, 'VIP seat price must be non-negative'),
    }),
    rowCount: zod_1.z.number().int().min(1, 'Row count must be a positive integer'),
    columnCount: zod_1.z.number().int().min(1, 'Column count must be a positive integer'),
    seats: zod_1.z
        .array(zod_1.z.object({
        uuid: zod_1.z.string().uuid('Invalid seat UUID format'),
        type: zod_1.z.enum(['regular', 'premium', 'vip', 'unavailable']),
        row: zod_1.z.number().int().min(0, 'Row must be non-negative'),
        column: zod_1.z.number().int().min(0, 'Column must be non-negative'),
        number: zod_1.z.string().min(1, 'Seat number is required'),
    }))
        .refine((seats) => {
        const seatNumbers = seats.map((s) => s.number);
        return seatNumbers.length === new Set(seatNumbers).size;
    }, { message: 'Seat numbers must be unique' })
        .refine((seats) => {
        const seatUuids = seats.map((s) => s.uuid);
        return seatUuids.length === new Set(seatUuids).size;
    }, { message: 'Seat UUIDs must be unique' })
        .refine((seats) => {
        return seats.every((seat) => seat.row < this.rowCount && seat.column < this.columnCount);
    }, { message: 'Seat positions must be within rowCount and columnCount' }),
});
