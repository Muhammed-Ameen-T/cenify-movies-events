"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const envErrorMsg_constants_1 = require(".././utils/constants/envErrorMsg.constants");
const httpResponseCode_utils_1 = require(".././utils/constants/httpResponseCode.utils");
const custom_error_1 = require("../utils/errors/custom.error");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.env = {
    // Server Configuration
    get PORT() {
        const port = process.env.PORT;
        if (!port) {
            throw new custom_error_1.CustomError(envErrorMsg_constants_1.EnvErrMsg.PORT_UNDEFINED, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
        const portNumber = parseInt(port, 10);
        if (isNaN(portNumber)) {
            throw new custom_error_1.CustomError(envErrorMsg_constants_1.EnvErrMsg.PORT_INVALID, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
        }
        return portNumber;
    },
    get NODE_ENV() {
        return process.env.NODE_ENV || 'development';
    },
    get CLIENT_ORIGIN() {
        if (!process.env.CLIENT_ORIGIN) {
            throw new custom_error_1.CustomError(envErrorMsg_constants_1.EnvErrMsg.CLIENT_ORIGIN_UNDEFINED, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
        return process.env.CLIENT_ORIGIN;
    },
    get API_BASE_URL() {
        // Renamed from VITE_API_URL to avoid frontend naming confusion
        if (!process.env.API_BASE_URL) {
            throw new custom_error_1.CustomError(envErrorMsg_constants_1.EnvErrMsg.API_BASE_URL_UNDEFINED, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
        return process.env.API_BASE_URL;
    },
    get VITE_API_URL() {
        // Renamed from VITE_API_URL to avoid frontend naming confusion
        if (!process.env.VITE_API_URL) {
            throw new custom_error_1.CustomError(envErrorMsg_constants_1.EnvErrMsg.VITE_URL_UNDEFINED, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
        return process.env.VITE_API_URL;
    },
    // JWT Configuration
    get ACCESS_TOKEN_SECRET() {
        // Using JWT_SECRET as fallback for compatibility
        const secret = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET;
        if (!secret) {
            throw new custom_error_1.CustomError(envErrorMsg_constants_1.EnvErrMsg.ACCESS_TOKEN_SECRET_UNDEFINED, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
        return secret;
    },
    get REFRESH_TOKEN_SECRET() {
        if (!process.env.REFRESH_TOKEN_SECRET) {
            throw new custom_error_1.CustomError(envErrorMsg_constants_1.EnvErrMsg.REFRESH_TOKEN_SECRET_UNDEFINED, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
        return process.env.REFRESH_TOKEN_SECRET;
    },
    get ACCESS_TOKEN_EXPIRY() {
        return process.env.ACCESS_TOKEN_EXPIRY || '15m'; // Default to 15 minutes
    },
    get REFRESH_TOKEN_EXPIRY() {
        return process.env.REFRESH_TOKEN_EXPIRY || '7d'; // Default to 7 days
    },
    // Session Configuration
    get SESSION_SECRET() {
        if (!process.env.SESSION_SECRET) {
            throw new custom_error_1.CustomError(envErrorMsg_constants_1.EnvErrMsg.SESSION_SECRET_UNDEFINED, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
        return process.env.SESSION_SECRET;
    },
    // Database Configuration
    get MONGO_URI() {
        if (!process.env.MONGO_URI) {
            throw new custom_error_1.CustomError(envErrorMsg_constants_1.EnvErrMsg.MONGO_URI_UNDEFINED, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
        return process.env.MONGO_URI;
    },
    get REDIS_HOST() {
        return process.env.REDIS_HOST || 'localhost';
    },
    get REDIS_PORT() {
        const port = process.env.REDIS_PORT || '6379';
        const portNumber = parseInt(port, 10);
        if (isNaN(portNumber)) {
            throw new custom_error_1.CustomError(envErrorMsg_constants_1.EnvErrMsg.REDIS_PORT_INVALID, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
        }
        return portNumber;
    },
    get REDIS_USERNAME() {
        return process.env.REDIS_USERNAME; // Optional
    },
    get REDIS_URL() {
        return process.env.REDIS_URL;
    },
    get REDIS_PASSWORD() {
        return process.env.REDIS_PASSWORD; // Optional
    },
    // Google Authentication
    get GOOGLE_CLIENT_ID() {
        if (!process.env.GOOGLE_CLIENT_ID) {
            throw new custom_error_1.CustomError(envErrorMsg_constants_1.EnvErrMsg.GOOGLE_CLIENT_ID_UNDEFINED, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
        return process.env.GOOGLE_CLIENT_ID;
    },
    get GOOGLE_CLIENT_SECRET() {
        if (!process.env.GOOGLE_CLIENT_SECRET) {
            throw new custom_error_1.CustomError(envErrorMsg_constants_1.EnvErrMsg.GOOGLE_CLIENT_SECRET_UNDEFINED, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
        return process.env.GOOGLE_CLIENT_SECRET;
    },
    get GOOGLE_REDIRECT_URI() {
        if (!process.env.GOOGLE_REDIRECT_URI) {
            throw new custom_error_1.CustomError(envErrorMsg_constants_1.EnvErrMsg.GOOGLE_REDIRECT_URI_UNDEFINED, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
        return process.env.GOOGLE_REDIRECT_URI;
    },
    // Facebook Authentication
    get FACEBOOK_APP_ID() {
        if (!process.env.FACEBOOK_APP_ID) {
            throw new custom_error_1.CustomError(envErrorMsg_constants_1.EnvErrMsg.FACEBOOK_APP_ID_UNDEFINED, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
        return process.env.FACEBOOK_APP_ID;
    },
    get FACEBOOK_APP_SECRET() {
        if (!process.env.FACEBOOK_APP_SECRET) {
            throw new custom_error_1.CustomError(envErrorMsg_constants_1.EnvErrMsg.FACEBOOK_APP_SECRET_UNDEFINED, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
        return process.env.FACEBOOK_APP_SECRET;
    },
    // Email Configuration (Nodemailer)
    get SMTP_HOST() {
        if (!process.env.SMTP_HOST) {
            throw new custom_error_1.CustomError(envErrorMsg_constants_1.EnvErrMsg.SMTP_HOST_UNDEFINED, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
        return process.env.SMTP_HOST;
    },
    get SMTP_PORT() {
        const port = process.env.SMTP_PORT || '587'; // Default for Gmail
        const portNumber = parseInt(port, 10);
        if (isNaN(portNumber)) {
            throw new custom_error_1.CustomError(envErrorMsg_constants_1.EnvErrMsg.SMTP_PORT_INVALID, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
        }
        return portNumber;
    },
    get SMTP_SECURE() {
        return process.env.SMTP_SECURE === 'true'; // Convert string to boolean
    },
    get SMTP_USERNAME() {
        // Using NODEMAILER_EMAIL as SMTP_USERNAME
        if (!process.env.NODEMAILER_EMAIL) {
            throw new custom_error_1.CustomError(envErrorMsg_constants_1.EnvErrMsg.SMTP_USERNAME_UNDEFINED, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
        return process.env.NODEMAILER_EMAIL;
    },
    get SMTP_PASSWORD() {
        // Using NODEMAILER_PASSWORD as SMTP_PASSWORD
        if (!process.env.NODEMAILER_PASSWORD) {
            throw new custom_error_1.CustomError(envErrorMsg_constants_1.EnvErrMsg.SMTP_PASSWORD_UNDEFINED, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
        return process.env.NODEMAILER_PASSWORD;
    },
    // Payment Gateways
    get RAZORPAY_ID_KEY() {
        if (!process.env.RAZORPAY_ID_KEY) {
            throw new custom_error_1.CustomError(envErrorMsg_constants_1.EnvErrMsg.RAZORPAY_ID_KEY_UNDEFINED, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
        return process.env.RAZORPAY_ID_KEY;
    },
    get RAZORPAY_SECRET_KEY() {
        if (!process.env.RAZORPAY_SECRET_KEY) {
            throw new custom_error_1.CustomError(envErrorMsg_constants_1.EnvErrMsg.RAZORPAY_SECRET_KEY_UNDEFINED, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
        return process.env.RAZORPAY_SECRET_KEY;
    },
    get PAYPAL_CLIENT_ID() {
        if (!process.env.PAYPAL_CLIENT_ID) {
            throw new custom_error_1.CustomError(envErrorMsg_constants_1.EnvErrMsg.PAYPAL_CLIENT_ID_UNDEFINED, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
        return process.env.PAYPAL_CLIENT_ID;
    },
    get PAYPAL_CLIENT_SECRET() {
        if (!process.env.PAYPAL_CLIENT_SECRET) {
            throw new custom_error_1.CustomError(envErrorMsg_constants_1.EnvErrMsg.PAYPAL_CLIENT_SECRET_UNDEFINED, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
        return process.env.PAYPAL_CLIENT_SECRET;
    },
    get STRIPE_PUBLISH_KEY() {
        if (!process.env.STRIPE_PUBLISH_KEY) {
            throw new custom_error_1.CustomError(envErrorMsg_constants_1.EnvErrMsg.STRIPE_PUBLISH_UNDEFINED, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
        return process.env.STRIPE_PUBLISH_KEY;
    },
    get STRIPE_SECRET_KEY() {
        if (!process.env.STRIPE_SECRET_KEY) {
            throw new custom_error_1.CustomError(envErrorMsg_constants_1.EnvErrMsg.STRIPE_SECRET_UNDEFINES, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
        return process.env.STRIPE_SECRET_KEY;
    },
    get STRIPE_WEBHOOK_SECRET() {
        if (!process.env.STRIPE_WEBHOOK_SECRET) {
            throw new custom_error_1.CustomError(envErrorMsg_constants_1.EnvErrMsg.STRIPE_WEBHOOK_SECRET_UNDEFINES, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
        return process.env.STRIPE_WEBHOOK_SECRET;
    },
    // Cloudinary Configuration
    get CLOUDINARY_CLOUD_NAME() {
        if (!process.env.CLOUDINARY_CLOUD_NAME) {
            throw new custom_error_1.CustomError(envErrorMsg_constants_1.EnvErrMsg.CLOUDINARY_CLOUD_NAME_UNDEFINED, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
        return process.env.CLOUDINARY_CLOUD_NAME;
    },
    get CLOUDINARY_API_KEY() {
        if (!process.env.CLOUDINARY_API_KEY) {
            throw new custom_error_1.CustomError(envErrorMsg_constants_1.EnvErrMsg.CLOUDINARY_API_KEY_UNDEFINED, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
        return process.env.CLOUDINARY_API_KEY;
    },
    get CLOUDINARY_API_SECRET() {
        if (!process.env.CLOUDINARY_API_SECRET) {
            throw new custom_error_1.CustomError(envErrorMsg_constants_1.EnvErrMsg.CLOUDINARY_API_SECRET_UNDEFINED, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
        return process.env.CLOUDINARY_API_SECRET;
    },
    get FAST2SMS_API_KEY() {
        if (!process.env.FAST2SMS_API_KEY) {
            throw new custom_error_1.CustomError(envErrorMsg_constants_1.EnvErrMsg.FAST2SMS_API_KEY_UNDEFINED, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
        return process.env.FAST2SMS_API_KEY;
    },
    get TWILIO_AUTH_TOKEN() {
        if (!process.env.TWILIO_AUTH_TOKEN) {
            throw new custom_error_1.CustomError(envErrorMsg_constants_1.EnvErrMsg.TWILIO_AUTH_TOKEN_UNDEFINED, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
        return process.env.TWILIO_AUTH_TOKEN;
    },
    get TWILIO_PHONE() {
        if (!process.env.TWILIO_PHONE) {
            throw new custom_error_1.CustomError(envErrorMsg_constants_1.EnvErrMsg.TWILIO_PHONE_UNDEFINED, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
        return process.env.TWILIO_PHONE;
    },
    get TWILIO_ACCOUNT_SID() {
        if (!process.env.TWILIO_ACCOUNT_SID) {
            throw new custom_error_1.CustomError(envErrorMsg_constants_1.EnvErrMsg.TWILIO_ACCOUNT_SID_UNDEFINED, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
        return process.env.TWILIO_ACCOUNT_SID;
    },
    // AWS Configuration (optional, added for completeness)
    get AWS_ACCESS_KEY_ID() {
        return process.env.AWS_ACCESS_KEY_ID; // Optional
    },
    get AWS_SECRET_ACCESS_KEY() {
        return process.env.AWS_SECRET_ACCESS_KEY; // Optional
    },
    get AWS_REGION() {
        return process.env.AWS_REGION; // Optional
    },
    get AWS_S3_BUCKET_NAME() {
        return process.env.AWS_S3_BUCKET_NAME; // Optional
    },
    get SES_EMAIL_FROM() {
        return process.env.SES_EMAIL_FROM; // Optional
    },
};
