"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateShowStatusSchema = exports.UpdateShowSchema = exports.CreateShowSchema = void 0;
const zod_1 = require("zod");
exports.CreateShowSchema = zod_1.z.object({
    theaterId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid theaterId format'),
    screenId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid screenId format'),
    movieId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid movieId format'),
    date: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid date format, must be a valid date',
    }),
    showTimes: zod_1.z
        .array(zod_1.z.object({
        startTime: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
            message: 'Invalid startTime format, must be a valid date',
        }),
        endTime: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
            message: 'Invalid endTime format, must be a valid date',
        }),
    }))
        .min(1, 'At least one showTime is required')
        .refine((showTimes) => {
        for (let i = 0; i < showTimes.length; i++) {
            for (let j = i + 1; j < showTimes.length; j++) {
                const startA = new Date(showTimes[i].startTime).getTime();
                const endA = new Date(showTimes[i].endTime).getTime();
                const startB = new Date(showTimes[j].startTime).getTime();
                const endB = new Date(showTimes[j].endTime).getTime();
                if ((startB >= startA && startB < endA) || // Overlaps within an existing show
                    (endB > startA && endB <= endA) || // Ends within an existing show
                    (startA >= startB && startA < endB) // Existing show overlaps with a new one
                ) {
                    return false;
                }
            }
        }
        return true;
    }, { message: 'ShowTimes cannot have overlapping times' }),
});
exports.UpdateShowSchema = zod_1.z.object({
    body: zod_1.z.object({
        startTime: zod_1.z
            .string()
            .refine((val) => !isNaN(Date.parse(val)), {
            message: 'Invalid startTime format, must be a valid date',
        })
            .optional(),
        movieId: zod_1.z.string().min(1, 'movieId is required').optional(),
        theaterId: zod_1.z.string().min(1, 'theaterId is required').optional(),
        screenId: zod_1.z.string().min(1, 'screenId is required').optional(),
        status: zod_1.z.enum(['Scheduled', 'Running', 'Completed', 'Cancelled']).optional(),
        bookedSeats: zod_1.z
            .array(zod_1.z.object({
            date: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
                message: 'Invalid date format',
            }),
            isPending: zod_1.z.boolean().optional(),
            seatNumber: zod_1.z.string().min(1, 'seatNumber is required'),
            seatPrice: zod_1.z.number().min(0, 'seatPrice must be non-negative'),
            type: zod_1.z.enum(['VIP', 'Regular', 'Premium']),
            position: zod_1.z.object({
                row: zod_1.z.number().int().min(0, 'row must be a non-negative integer'),
                col: zod_1.z.number().int().min(0, 'col must be a non-negative integer'),
            }),
            userId: zod_1.z.string().min(1, 'userId is required'),
        }))
            .optional(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Show ID is required'),
    }),
});
exports.UpdateShowStatusSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum(['Scheduled', 'Running', 'Completed', 'Cancelled'], {
            errorMap: () => ({ message: 'Invalid status' }),
        }),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, 'Show ID is required'),
    }),
});
