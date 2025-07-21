"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendOtpPhoneUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const redis_service_1 = require("../../../infrastructure/services/redis.service");
const sms_service_1 = require("../../../infrastructure/services/sms.service");
const custom_error_1 = require("../../../utils/errors/custom.error");
const commonErrorMsg_constants_1 = __importDefault(require("../../../utils/constants/commonErrorMsg.constants"));
const httpResponseCode_utils_1 = require("../../../utils/constants/httpResponseCode.utils");
const otp_utils_1 = require("../../../utils/helpers/otp.utils");
let SendOtpPhoneUseCase = class SendOtpPhoneUseCase {
    constructor(userRepository, redisService, smsService) {
        this.userRepository = userRepository;
        this.redisService = redisService;
        this.smsService = smsService;
    }
    async execute(dto) {
        const parsedPhone = parseInt(dto.phone, 10);
        // Check if phone number is already in use by another user
        const existingUser = await this.userRepository.findByPhone(parsedPhone);
        const otp = (0, otp_utils_1.generateOtp)(6);
        const otpKey = `otp:phone:${dto.phone}:${dto.userId}`;
        try {
            await this.redisService.set(otpKey, otp, 300); // 5-minute expiry
            console.log('SendOtpPhoneUseCase: Stored OTP in Redis:', { otpKey, otp });
        }
        catch (error) {
            console.error('SendOtpPhoneUseCase: Redis error:', error);
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.DATABASE.FAILED_STORING_OTP, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
        try {
            await this.smsService.sendSms(dto.phone, `Your OTP is ${otp}. It is valid for 5 minutes.`);
            console.log('SendOtpPhoneUseCase: OTP SMS sent to:', dto.phone);
        }
        catch (error) {
            console.error('SendOtpPhoneUseCase: SMS service error:', error);
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.GENERAL.FAILED_SENDING_OTP, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.SendOtpPhoneUseCase = SendOtpPhoneUseCase;
exports.SendOtpPhoneUseCase = SendOtpPhoneUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IUserRepository')),
    __param(1, (0, tsyringe_1.inject)('RedisService')),
    __param(2, (0, tsyringe_1.inject)('SmsService')),
    __metadata("design:paramtypes", [Object, redis_service_1.RedisService,
        sms_service_1.SmsService])
], SendOtpPhoneUseCase);
