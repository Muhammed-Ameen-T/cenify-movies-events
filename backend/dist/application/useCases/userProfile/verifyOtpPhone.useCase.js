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
exports.VerifyOtpPhoneUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const redis_service_1 = require("../../../infrastructure/services/redis.service");
const custom_error_1 = require("../../../utils/errors/custom.error");
const commonErrorMsg_constants_1 = __importDefault(require("../../../utils/constants/commonErrorMsg.constants"));
const httpResponseCode_utils_1 = require("../../../utils/constants/httpResponseCode.utils");
let VerifyOtpPhoneUseCase = class VerifyOtpPhoneUseCase {
    constructor(redisService) {
        this.redisService = redisService;
    }
    async execute(dto) {
        const otpKey = `otp:phone:${dto.phone}:${dto.userId}`;
        const storedOtp = await this.redisService.get(otpKey);
        if (!storedOtp || storedOtp !== dto.otp) {
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.INVALID_OTP, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
        }
        await this.redisService.del(otpKey);
        console.log('VerifyOtpPhoneUseCase: OTP verified and deleted from Redis:', { otpKey });
    }
};
exports.VerifyOtpPhoneUseCase = VerifyOtpPhoneUseCase;
exports.VerifyOtpPhoneUseCase = VerifyOtpPhoneUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('RedisService')),
    __metadata("design:paramtypes", [redis_service_1.RedisService])
], VerifyOtpPhoneUseCase);
