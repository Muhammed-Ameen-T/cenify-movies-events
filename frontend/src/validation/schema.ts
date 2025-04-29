import { z } from 'zod';

export const registerSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address').min(1, 'Email is required'),
    phone: z.string().regex(/^\d{10}$/, 'Phone number must be 10 digits').min(1, 'Phone number is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm password is required'),
    accountType: z.enum(['theater', 'event']),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });



export const theaterDetailsSchema = z.object({
  images: z.array(z.string()).min(3, 'At least 3 images are required').max(5, 'Maximum 5 images allowed'),
  city: z.string().min(1, 'City is required'),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  facilities: z.object({
    foodCourt: z.boolean(),
    lounges: z.boolean(),
    mTicket: z.boolean(),
    parking: z.boolean(),
    freeCancellation: z.boolean(),
  }),
  intervalTime: z.enum(['5', '10', '15', '20', '30'], { message: 'Invalid interval time' }),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const vendorRegisterSchema = z
  .object({
    name: z.string().min(3, "Vendor name must be at least 3 characters").max(100, "Vendor name is too long"),
    email: z.string().email("Invalid email address"),
    phone: z
      .string()
      .min(1, "Phone number is required")
      .regex(/^\+?\d{10,15}$/, "Phone number must be 10–15 digits, optionally starting with '+'"),
    password: z.string().min(8, "Password must be at least 8 characters").max(50, "Password is too long"),
    confirmPassword: z.string(),
    accountType: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });


export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only digits"),
});







