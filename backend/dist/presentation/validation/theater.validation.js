"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.theaterUpdateSchema = void 0;
// src/domain/validations/theater.validation.ts
const zod_1 = require("zod");
exports.theaterUpdateSchema = zod_1.z.object({
    name: zod_1.z.string().min(3, 'Name must be at least 3 characters').optional(),
    location: zod_1.z
        .object({
        city: zod_1.z.string().min(1, 'City is required'),
        coordinates: zod_1.z.tuple([zod_1.z.number(), zod_1.z.number()]).optional(),
        type: zod_1.z.string().optional(),
    })
        .optional(),
    email: zod_1.z.string().email('Invalid email').optional(),
    phone: zod_1.z.number().min(1000000000, 'Phone number must be valid').optional(),
    description: zod_1.z.string().optional(),
    intervalTime: zod_1.z.number().min(0, 'Interval time must be non-negative').optional(),
    facilities: zod_1.z
        .object({
        foodCourt: zod_1.z.boolean().optional(),
        lounges: zod_1.z.boolean().optional(),
        mTicket: zod_1.z.boolean().optional(),
        parking: zod_1.z.boolean().optional(),
        freeCancellation: zod_1.z.boolean().optional(),
    })
        .optional(),
    gallery: zod_1.z.array(zod_1.z.string().url()).optional(),
});
