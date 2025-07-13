// src/presentation/validation/otp.validation.ts
import { z } from 'zod';

// Schema for sending OTP to a phone number
export const SendOtpPhoneSchema = z.object({
  phone: z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
});

// Schema for verifying OTP against a phone number
export const VerifyOtpPhoneSchema = z.object({
  phone: z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});
