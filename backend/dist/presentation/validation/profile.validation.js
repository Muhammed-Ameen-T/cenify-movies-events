"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyOtpPhoneSchema = exports.SendOtpPhoneSchema = void 0;
// src/presentation/validation/otp.validation.ts
const zod_1 = require("zod");
// Schema for sending OTP to a phone number
exports.SendOtpPhoneSchema = zod_1.z.object({
    phone: zod_1.z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
});
// Schema for verifying OTP against a phone number
exports.VerifyOtpPhoneSchema = zod_1.z.object({
    phone: zod_1.z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
    otp: zod_1.z.string().length(6, 'OTP must be 6 digits'),
});
