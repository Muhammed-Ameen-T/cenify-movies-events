"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateScreenSchema = exports.CreateScreenSchema = void 0;
const zod_1 = require("zod");
// Schema for CreateScreenDTO
exports.CreateScreenSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Screen name is required'),
    theaterId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid theaterId format'),
    seatLayoutId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid seatLayoutId format'),
    amenities: zod_1.z
        .object({
        is3D: zod_1.z.boolean().optional(),
        is4K: zod_1.z.boolean().optional(),
        isDolby: zod_1.z.boolean().optional(),
    })
        .optional(),
});
// Schema for UpdateScreenDTO
exports.UpdateScreenSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Screen name must not be empty').optional(),
    theaterId: zod_1.z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid theaterId format')
        .optional(),
    seatLayoutId: zod_1.z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid seatLayoutId format')
        .optional(),
    amenities: zod_1.z
        .object({
        is3D: zod_1.z.boolean().optional(),
        is4K: zod_1.z.boolean().optional(),
        isDolby: zod_1.z.boolean().optional(),
    })
        .optional(),
});
