import { z } from 'zod';

export const SendOtpSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export const VerifyOtpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.string().email('Invalid email format'),
  otp: z.string().length(6, 'OTP must be exactly 6 digits'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  accountType: z.string().nonempty('Account type is required'),
});
