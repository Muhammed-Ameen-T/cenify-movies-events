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
exports.LoginUserUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const auth_dto_1 = require("../../dtos/auth.dto");
const jwt_service_1 = require("../../../infrastructure/services/jwt.service");
const custom_error_1 = require("../../../utils/errors/custom.error");
const httpResponseCode_utils_1 = require("../../../utils/constants/httpResponseCode.utils");
const commonErrorMsg_constants_1 = __importDefault(require("../../../utils/constants/commonErrorMsg.constants"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
/**
 * Handles the user login process using dependency injection for authentication and database operations.
 */
let LoginUserUseCase = class LoginUserUseCase {
    /**
     * Initializes the LoginUserUseCase with injected dependencies.
     *
     * @param {IUserRepository} userRepository - Repository for user data retrieval.
     * @param {JwtService} jwtService - Service for JWT token generation.
     */
    constructor(userRepository, jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }
    /**
     * Executes the login process.
     * Validates user credentials, checks blocking status, and generates authentication tokens.
     *
     * @param {LoginDTO} dto - Data Transfer Object containing email and password.
     * @returns {Promise<AuthResponseDTO>} Returns access and refresh tokens along with user details.
     * @throws {CustomError} If user is not found, blocked, or password mismatch occurs.
     */
    async execute(dto) {
        const user = await this.userRepository.findByEmail(dto.email);
        if (!user) {
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.AUTHENTICATION.USER_NOT_FOUND, httpResponseCode_utils_1.HttpResCode.UNAUTHORIZED);
        }
        if (user.isBlocked) {
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.AUTHENTICATION.BLOCKED_USER, httpResponseCode_utils_1.HttpResCode.UNAUTHORIZED);
        }
        if (user.role != 'user') {
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.AUTHENTICATION.YOUR_NOT_USER, httpResponseCode_utils_1.HttpResCode.UNAUTHORIZED);
        }
        const isMatch = await bcryptjs_1.default.compare(dto.password, user.password);
        if (!isMatch) {
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.PASSWORD_MISMATCH, httpResponseCode_utils_1.HttpResCode.UNAUTHORIZED);
        }
        const accessToken = this.jwtService.generateAccessToken(user._id.toString(), 'user');
        const refreshToken = this.jwtService.generateRefreshToken(user._id.toString(), 'user');
        return new auth_dto_1.AuthResponseDTO(accessToken, refreshToken, {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            phone: user.phone || 0,
            profileImage: user.profileImage,
            role: user.role,
        });
    }
};
exports.LoginUserUseCase = LoginUserUseCase;
exports.LoginUserUseCase = LoginUserUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IUserRepository')),
    __param(1, (0, tsyringe_1.inject)('JwtService')),
    __metadata("design:paramtypes", [Object, jwt_service_1.JwtService])
], LoginUserUseCase);
