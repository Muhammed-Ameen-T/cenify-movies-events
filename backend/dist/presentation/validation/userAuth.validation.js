"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyOtpSchema = exports.SendOtpSchema = void 0;
const zod_1 = require("zod");
exports.SendOtpSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
});
exports.VerifyOtpSchema = zod_1.z.object({
    name: zod_1.z.string().min(3, 'Name must be at least 3 characters long'),
    email: zod_1.z.string().email('Invalid email format'),
    otp: zod_1.z.string().length(6, 'OTP must be exactly 6 digits'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters long'),
});
