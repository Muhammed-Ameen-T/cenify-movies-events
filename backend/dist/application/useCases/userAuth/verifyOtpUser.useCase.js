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
exports.VerifyOtpUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const jwt_service_1 = require("../../../infrastructure/services/jwt.service");
const redis_service_1 = require("../../../infrastructure/services/redis.service");
const custom_error_1 = require("../../../utils/errors/custom.error");
const auth_dto_1 = require("../../dtos/auth.dto");
const commonErrorMsg_constants_1 = __importDefault(require("../../../utils/constants/commonErrorMsg.constants"));
const httpResponseCode_utils_1 = require("../../../utils/constants/httpResponseCode.utils");
const user_entity_1 = require("../../../domain/entities/user.entity");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const wallet_entity_1 = require("../../../domain/entities/wallet.entity");
/**
 * Use case for verifying OTP during user registration.
 * Validates the OTP, creates a new user, and generates authentication tokens.
 */
let VerifyOtpUseCase = class VerifyOtpUseCase {
    /**
     * Initializes the VerifyOtpUseCase with dependencies for user repository, JWT service, and Redis service.
     *
     * @param {IUserRepository} authRepository - Repository for user management.
     * @param {JwtService} jwtService - Service for JWT handling.
     * @param {RedisService} redisService - Service for storing and retrieving OTPs.
     */
    constructor(authRepository, jwtService, walletRepository, redisService) {
        this.authRepository = authRepository;
        this.jwtService = jwtService;
        this.walletRepository = walletRepository;
        this.redisService = redisService;
    }
    /**
     * Executes the OTP verification process.
     * Checks if the stored OTP matches the provided OTP, registers the user, and generates authentication tokens.
     *
     * @param {VerifyOtpDTO} dto - DTO containing user details and OTP for verification.
     * @returns {Promise<AuthResponseDTO>} Returns authentication tokens and user details if OTP validation succeeds.
     * @throws {CustomError} If OTP is invalid or user creation fails.
     */
    async execute(dto) {
        console.log(dto);
        const storedOtp = await this.redisService.get(`otp:${dto.email}`);
        console.log('storedOtp:', storedOtp);
        if (!storedOtp || storedOtp != dto.otp) {
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.INVALID_OTP, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
        }
        await this.redisService.del(`otp:${dto.email}`);
        const hashedPassword = await bcryptjs_1.default.hash(dto.password, 10);
        // Create new user
        let user = new user_entity_1.User(null, dto.name, dto.email, null, null, hashedPassword, null, null, { buyDate: null, expiryDate: null, isPass: null }, 0, false, 'user', new Date(), new Date());
        const savedUser = await this.authRepository.create(user);
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const createdUser = await this.authRepository.findByEmail(user.email.toLocaleLowerCase());
        console.log('newcreatedUser:', createdUser);
        if (!createdUser) {
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.AUTHENTICATION.USER_NOT_FOUND, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
        const newWallet = new wallet_entity_1.Wallet(null, createdUser._id?.toString(), 0, [], new Date(), new Date());
        await this.walletRepository.createWallet(newWallet);
        const accessToken = this.jwtService.generateAccessToken(createdUser._id?.toString(), 'user');
        const refreshToken = this.jwtService.generateRefreshToken(createdUser._id?.toString(), 'user');
        return new auth_dto_1.AuthResponseDTO(accessToken, refreshToken, {
            id: createdUser._id?.toString(),
            email: createdUser.email,
            name: createdUser.name,
            phone: createdUser.phone,
            profileImage: createdUser.profileImage,
            role: createdUser.role,
        });
    }
};
exports.VerifyOtpUseCase = VerifyOtpUseCase;
exports.VerifyOtpUseCase = VerifyOtpUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IUserRepository')),
    __param(1, (0, tsyringe_1.inject)('JwtService')),
    __param(2, (0, tsyringe_1.inject)('WalletRepository')),
    __param(3, (0, tsyringe_1.inject)('RedisService')),
    __metadata("design:paramtypes", [Object, jwt_service_1.JwtService, Object, redis_service_1.RedisService])
], VerifyOtpUseCase);
