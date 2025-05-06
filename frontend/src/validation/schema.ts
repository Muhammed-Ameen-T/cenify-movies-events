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
    name: z.string().min(1, 'Theater name is required'),
    description: z.string().min(10, 'Description must be at least 10 characters long'),
    email: z.string().email('Invalid email address').min(1, 'Email is required'),
    phone: z
      .string()
      .min(1, 'Phone number is required')
      .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
    facilities: z.object({
      foodCourt: z.boolean(),
      lounges: z.boolean(),
      mTicket: z.boolean(),
      parking: z.boolean(),
      freeCancellation: z.boolean(),
    }),
    intervalTime: z.string().min(1, 'Interval time is required'),
    location: z.object({
      city: z.string().min(1, 'City is required'),
      coordinates: z.array(z.number()).length(2, 'Coordinates must contain latitude and longitude'),
      type: z.literal('point'),
    }),
    gallery: z
      .array(z.string())
      .min(3, 'At least 3 images are required')
      .max(5, 'Maximum 5 images allowed'),
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








// Schema for email input (request password reset)
export const resetPasswordSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .nonempty('Email is required'),
});



// Schema for new password and confirm password
export const newPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .nonempty('Password is required'),
    confirmPassword: z
      .string()
      .min(8, 'Confirm password must be at least 8 characters')
      .nonempty('Confirm password is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });




  export const eventSchema = z.object({
    name: z.string().min(1, 'Event name is required'),
    date: z.string().min(1, 'Date is required'),
    time: z.string().min(1, 'Time is required'),
    theaterId: z.string().min(1, 'Theater is required'),
    ticketPrice: z.number().min(0, 'Ticket price must be non-negative'),
  });
  
  export const theaterSchema = z.object({
    name: z.string().min(1, 'Theater name is required'),
    location: z.string().min(1, 'Location is required'),
    rows: z.number().min(1, 'At least 1 row required'),
    seatsPerRow: z.number().min(1, 'At least 1 seat per row required'),
  });