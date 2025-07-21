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
exports.VerifyOtpVendorUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const jwt_service_1 = require("../../../infrastructure/services/jwt.service");
const redis_service_1 = require("../../../infrastructure/services/redis.service");
const custom_error_1 = require("../../../utils/errors/custom.error");
const auth_dto_1 = require("../../dtos/auth.dto");
const commonErrorMsg_constants_1 = __importDefault(require("../../../utils/constants/commonErrorMsg.constants"));
const httpResponseCode_utils_1 = require("../../../utils/constants/httpResponseCode.utils");
const hash_utils_1 = require("../../../utils/helpers/hash.utils");
const user_entity_1 = require("../../../domain/entities/user.entity");
let VerifyOtpVendorUseCase = class VerifyOtpVendorUseCase {
    constructor(vendorRepository, jwtService, redisService, authRepository) {
        this.vendorRepository = vendorRepository;
        this.jwtService = jwtService;
        this.redisService = redisService;
        this.authRepository = authRepository;
    }
    async execute(dto) {
        const storedOtp = await this.redisService.get(`otp:${dto.email}`);
        console.log('storedOtp:', storedOtp);
        if (!storedOtp) {
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.INVALID_OTP, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
        }
        const existingTheater = await this.vendorRepository.findByEmail(dto.email);
        if (existingTheater) {
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.USER_ALREADY_EXISTS, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
        }
        const hashedPassword = await (0, hash_utils_1.hashPassword)(dto.password);
        let vendor = new user_entity_1.User(null, dto.name, dto.email, dto.phone, null, hashedPassword, null, null, { buyDate: null, expiryDate: null, isPass: null }, 0, false, 'vendor', new Date(), new Date());
        console.log('sadas');
        try {
            const created = await this.authRepository.create(vendor);
        }
        catch (error) {
            console.log(error);
        }
        const createdVendor = await this.authRepository.findByEmail(dto.email);
        console.log('created Vendor:', createdVendor);
        if (!createdVendor) {
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.AUTHENTICATION.USER_NOT_FOUND, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
        // Generate JWT tokens
        const accessToken = this.jwtService.generateAccessToken(createdVendor._id.toString(), createdVendor.role);
        const refreshToken = this.jwtService.generateRefreshToken(createdVendor._id.toString(), createdVendor.role);
        await this.redisService.del(`otp:${dto.email}`);
        return new auth_dto_1.AuthResponseDTO(accessToken, refreshToken, {
            id: createdVendor._id.toString(),
            email: createdVendor.email,
            name: createdVendor.name,
            phone: createdVendor.phone,
            profileImage: createdVendor.profileImage,
            role: createdVendor.role,
        });
    }
};
exports.VerifyOtpVendorUseCase = VerifyOtpVendorUseCase;
exports.VerifyOtpVendorUseCase = VerifyOtpVendorUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('TheaterRepository')),
    __param(1, (0, tsyringe_1.inject)('JwtService')),
    __param(2, (0, tsyringe_1.inject)('RedisService')),
    __param(3, (0, tsyringe_1.inject)('IUserRepository')),
    __metadata("design:paramtypes", [Object, jwt_service_1.JwtService,
        redis_service_1.RedisService, Object])
], VerifyOtpVendorUseCase);
