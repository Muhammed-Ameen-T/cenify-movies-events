import { EnvErrMsg } from '.././utils/constants/envErrorMsg.constants';
import { HttpResCode } from '.././utils/constants/httpResponseCode.utils';
import { CustomError } from '../utils/errors/custom.error';
import dotenv from 'dotenv';
dotenv.config();

export const env = {
  // Server Configuration
  get PORT(): number {
    const port = process.env.PORT;
    if (!port) {
      throw new CustomError(EnvErrMsg.PORT_UNDEFINED, HttpResCode.INTERNAL_SERVER_ERROR);
    }
    const portNumber = parseInt(port, 10);
    if (isNaN(portNumber)) {
      throw new CustomError(EnvErrMsg.PORT_INVALID, HttpResCode.BAD_REQUEST);
    }
    return portNumber;
  },

  get NODE_ENV(): string {
    return process.env.NODE_ENV || 'development';
  },

  get CLIENT_ORIGIN(): string {
    if (!process.env.CLIENT_ORIGIN) {
      throw new CustomError(EnvErrMsg.CLIENT_ORIGIN_UNDEFINED, HttpResCode.INTERNAL_SERVER_ERROR);
    }
    return process.env.CLIENT_ORIGIN;
  },

  get API_BASE_URL(): string {
    // Renamed from VITE_API_URL to avoid frontend naming confusion
    if (!process.env.API_BASE_URL) {
      throw new CustomError(EnvErrMsg.API_BASE_URL_UNDEFINED, HttpResCode.INTERNAL_SERVER_ERROR);
    }
    return process.env.API_BASE_URL;
  },

  get VITE_API_URL(): string {
    // Renamed from VITE_API_URL to avoid frontend naming confusion
    if (!process.env.VITE_API_URL) {
      throw new CustomError(EnvErrMsg.VITE_URL_UNDEFINED, HttpResCode.INTERNAL_SERVER_ERROR);
    }
    return process.env.VITE_API_URL;
  },

  // JWT Configuration
  get ACCESS_TOKEN_SECRET(): string {
    // Using JWT_SECRET as fallback for compatibility
    const secret = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET;
    if (!secret) {
      throw new CustomError(
        EnvErrMsg.ACCESS_TOKEN_SECRET_UNDEFINED,
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
    return secret;
  },

  get REFRESH_TOKEN_SECRET(): string {
    if (!process.env.REFRESH_TOKEN_SECRET) {
      throw new CustomError(
        EnvErrMsg.REFRESH_TOKEN_SECRET_UNDEFINED,
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
    return process.env.REFRESH_TOKEN_SECRET;
  },

  get ACCESS_TOKEN_EXPIRY(): string {
    return process.env.ACCESS_TOKEN_EXPIRY || '15m'; // Default to 15 minutes
  },

  get REFRESH_TOKEN_EXPIRY(): string {
    return process.env.REFRESH_TOKEN_EXPIRY || '7d'; // Default to 7 days
  },

  // Session Configuration
  get SESSION_SECRET(): string {
    if (!process.env.SESSION_SECRET) {
      throw new CustomError(EnvErrMsg.SESSION_SECRET_UNDEFINED, HttpResCode.INTERNAL_SERVER_ERROR);
    }
    return process.env.SESSION_SECRET;
  },

  // Database Configuration
  get MONGO_URI(): string {
    if (!process.env.MONGO_URI) {
      throw new CustomError(EnvErrMsg.MONGO_URI_UNDEFINED, HttpResCode.INTERNAL_SERVER_ERROR);
    }
    return process.env.MONGO_URI;
  },

  get REDIS_HOST(): string {
    return process.env.REDIS_HOST || 'localhost';
  },

  get REDIS_PORT(): number {
    const port = process.env.REDIS_PORT || '6379';
    const portNumber = parseInt(port, 10);
    if (isNaN(portNumber)) {
      throw new CustomError(EnvErrMsg.REDIS_PORT_INVALID, HttpResCode.BAD_REQUEST);
    }
    return portNumber;
  },

  get REDIS_USERNAME(): string | undefined {
    return process.env.REDIS_USERNAME; // Optional
  },
  get REDIS_URL(): string | undefined {
    return process.env.REDIS_URL;
  },

  get REDIS_PASSWORD(): string | undefined {
    return process.env.REDIS_PASSWORD; // Optional
  },

  // Google Authentication
  get GOOGLE_CLIENT_ID(): string {
    if (!process.env.GOOGLE_CLIENT_ID) {
      throw new CustomError(
        EnvErrMsg.GOOGLE_CLIENT_ID_UNDEFINED,
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
    return process.env.GOOGLE_CLIENT_ID;
  },

  get GOOGLE_CLIENT_SECRET(): string {
    if (!process.env.GOOGLE_CLIENT_SECRET) {
      throw new CustomError(
        EnvErrMsg.GOOGLE_CLIENT_SECRET_UNDEFINED,
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
    return process.env.GOOGLE_CLIENT_SECRET;
  },

  get GOOGLE_REDIRECT_URI(): string {
    if (!process.env.GOOGLE_REDIRECT_URI) {
      throw new CustomError(
        EnvErrMsg.GOOGLE_REDIRECT_URI_UNDEFINED,
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
    return process.env.GOOGLE_REDIRECT_URI;
  },

  // Facebook Authentication
  get FACEBOOK_APP_ID(): string {
    if (!process.env.FACEBOOK_APP_ID) {
      throw new CustomError(EnvErrMsg.FACEBOOK_APP_ID_UNDEFINED, HttpResCode.INTERNAL_SERVER_ERROR);
    }
    return process.env.FACEBOOK_APP_ID;
  },

  get FACEBOOK_APP_SECRET(): string {
    if (!process.env.FACEBOOK_APP_SECRET) {
      throw new CustomError(
        EnvErrMsg.FACEBOOK_APP_SECRET_UNDEFINED,
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
    return process.env.FACEBOOK_APP_SECRET;
  },

  // Email Configuration (Nodemailer)
  get SMTP_HOST(): string {
    if (!process.env.SMTP_HOST) {
      throw new CustomError(EnvErrMsg.SMTP_HOST_UNDEFINED, HttpResCode.INTERNAL_SERVER_ERROR);
    }
    return process.env.SMTP_HOST;
  },

  get SMTP_PORT(): number {
    const port = process.env.SMTP_PORT || '587'; // Default for Gmail
    const portNumber = parseInt(port, 10);
    if (isNaN(portNumber)) {
      throw new CustomError(EnvErrMsg.SMTP_PORT_INVALID, HttpResCode.BAD_REQUEST);
    }
    return portNumber;
  },

  get SMTP_SECURE(): boolean {
    return process.env.SMTP_SECURE === 'true'; // Convert string to boolean
  },

  get SMTP_USERNAME(): string {
    // Using NODEMAILER_EMAIL as SMTP_USERNAME
    if (!process.env.NODEMAILER_EMAIL) {
      throw new CustomError(EnvErrMsg.SMTP_USERNAME_UNDEFINED, HttpResCode.INTERNAL_SERVER_ERROR);
    }
    return process.env.NODEMAILER_EMAIL;
  },

  get SMTP_PASSWORD(): string {
    // Using NODEMAILER_PASSWORD as SMTP_PASSWORD
    if (!process.env.NODEMAILER_PASSWORD) {
      throw new CustomError(EnvErrMsg.SMTP_PASSWORD_UNDEFINED, HttpResCode.INTERNAL_SERVER_ERROR);
    }
    return process.env.NODEMAILER_PASSWORD;
  },

  // Payment Gateways
  get RAZORPAY_ID_KEY(): string {
    if (!process.env.RAZORPAY_ID_KEY) {
      throw new CustomError(EnvErrMsg.RAZORPAY_ID_KEY_UNDEFINED, HttpResCode.INTERNAL_SERVER_ERROR);
    }
    return process.env.RAZORPAY_ID_KEY;
  },

  get RAZORPAY_SECRET_KEY(): string {
    if (!process.env.RAZORPAY_SECRET_KEY) {
      throw new CustomError(
        EnvErrMsg.RAZORPAY_SECRET_KEY_UNDEFINED,
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
    return process.env.RAZORPAY_SECRET_KEY;
  },

  get PAYPAL_CLIENT_ID(): string {
    if (!process.env.PAYPAL_CLIENT_ID) {
      throw new CustomError(
        EnvErrMsg.PAYPAL_CLIENT_ID_UNDEFINED,
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
    return process.env.PAYPAL_CLIENT_ID;
  },

  get PAYPAL_CLIENT_SECRET(): string {
    if (!process.env.PAYPAL_CLIENT_SECRET) {
      throw new CustomError(
        EnvErrMsg.PAYPAL_CLIENT_SECRET_UNDEFINED,
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
    return process.env.PAYPAL_CLIENT_SECRET;
  },

  get STRIPE_PUBLISH_KEY(): string {
    if (!process.env.STRIPE_PUBLISH_KEY) {
      throw new CustomError(EnvErrMsg.STRIPE_PUBLISH_UNDEFINED, HttpResCode.INTERNAL_SERVER_ERROR);
    }
    return process.env.STRIPE_PUBLISH_KEY;
  },

  get STRIPE_SECRET_KEY(): string {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new CustomError(EnvErrMsg.STRIPE_SECRET_UNDEFINES, HttpResCode.INTERNAL_SERVER_ERROR);
    }
    return process.env.STRIPE_SECRET_KEY;
  },
  get STRIPE_WEBHOOK_SECRET(): string {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new CustomError(
        EnvErrMsg.STRIPE_WEBHOOK_SECRET_UNDEFINES,
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
    return process.env.STRIPE_WEBHOOK_SECRET;
  },

  // Cloudinary Configuration
  get CLOUDINARY_CLOUD_NAME(): string {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      throw new CustomError(
        EnvErrMsg.CLOUDINARY_CLOUD_NAME_UNDEFINED,
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
    return process.env.CLOUDINARY_CLOUD_NAME;
  },

  get CLOUDINARY_API_KEY(): string {
    if (!process.env.CLOUDINARY_API_KEY) {
      throw new CustomError(
        EnvErrMsg.CLOUDINARY_API_KEY_UNDEFINED,
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
    return process.env.CLOUDINARY_API_KEY;
  },

  get CLOUDINARY_API_SECRET(): string {
    if (!process.env.CLOUDINARY_API_SECRET) {
      throw new CustomError(
        EnvErrMsg.CLOUDINARY_API_SECRET_UNDEFINED,
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
    return process.env.CLOUDINARY_API_SECRET;
  },

  get FAST2SMS_API_KEY(): string {
    if (!process.env.FAST2SMS_API_KEY) {
      throw new CustomError(
        EnvErrMsg.FAST2SMS_API_KEY_UNDEFINED,
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
    return process.env.FAST2SMS_API_KEY;
  },

  get TWILIO_AUTH_TOKEN(): string {
    if (!process.env.TWILIO_AUTH_TOKEN) {
      throw new CustomError(
        EnvErrMsg.TWILIO_AUTH_TOKEN_UNDEFINED,
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
    return process.env.TWILIO_AUTH_TOKEN;
  },

  get TWILIO_PHONE(): string {
    if (!process.env.TWILIO_PHONE) {
      throw new CustomError(EnvErrMsg.TWILIO_PHONE_UNDEFINED, HttpResCode.INTERNAL_SERVER_ERROR);
    }
    return process.env.TWILIO_PHONE;
  },

  get TWILIO_ACCOUNT_SID(): string {
    if (!process.env.TWILIO_ACCOUNT_SID) {
      throw new CustomError(
        EnvErrMsg.TWILIO_ACCOUNT_SID_UNDEFINED,
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
    return process.env.TWILIO_ACCOUNT_SID;
  },

  // AWS Configuration (optional, added for completeness)
  get AWS_ACCESS_KEY_ID(): string | undefined {
    return process.env.AWS_ACCESS_KEY_ID; // Optional
  },

  get AWS_SECRET_ACCESS_KEY(): string | undefined {
    return process.env.AWS_SECRET_ACCESS_KEY; // Optional
  },

  get AWS_REGION(): string | undefined {
    return process.env.AWS_REGION; // Optional
  },

  get AWS_S3_BUCKET_NAME(): string | undefined {
    return process.env.AWS_S3_BUCKET_NAME; // Optional
  },

  get SES_EMAIL_FROM(): string | undefined {
    return process.env.SES_EMAIL_FROM; // Optional
  },
};
