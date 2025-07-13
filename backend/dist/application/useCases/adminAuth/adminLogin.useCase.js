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
exports.LoginAdminUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const auth_dto_1 = require("../../dtos/auth.dto");
const jwt_service_1 = require("../../../infrastructure/services/jwt.service");
const custom_error_1 = require("../../../utils/errors/custom.error");
const httpResponseCode_utils_1 = require("../../../utils/constants/httpResponseCode.utils");
const commonErrorMsg_constants_1 = __importDefault(require("../../../utils/constants/commonErrorMsg.constants"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
/**
 * Use case for handling admin login.
 * Validates admin credentials and generates authentication tokens.
 */
let LoginAdminUseCase = class LoginAdminUseCase {
    /**
     * Initializes the LoginAdminUseCase with injected dependencies.
     *
     * @param {IUserRepository} userRepository - Repository for user data retrieval.
     * @param {JwtService} jwtService - Service for JWT token generation.
     */
    constructor(userRepository, jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }
    /**
     * Executes the admin login process.
     * Validates admin credentials, checks blocking status, and generates authentication tokens.
     *
     * @param {LoginDTO} dto - Data Transfer Object containing email and password.
     * @returns {Promise<AuthResponseDTO>} Returns access and refresh tokens along with admin details.
     * @throws {CustomError} If the admin is not found, blocked, or password mismatch occurs.
     */
    async execute(dto) {
        const admin = await this.userRepository.findByEmail(dto.email);
        if (!admin) {
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.AUTHENTICATION.USER_NOT_FOUND, httpResponseCode_utils_1.HttpResCode.UNAUTHORIZED);
        }
        if (admin.role !== 'admin') {
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.AUTHENTICATION.YOUR_NOT_ADMIN, httpResponseCode_utils_1.HttpResCode.FORBIDDEN);
        }
        if (admin.isBlocked) {
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.AUTHENTICATION.BLOCKED_USER, httpResponseCode_utils_1.HttpResCode.UNAUTHORIZED);
        }
        console.log(dto.password, admin.password);
        const isMatch = await bcryptjs_1.default.compare(dto.password, admin.password);
        if (!isMatch) {
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.PASSWORD_MISMATCH, httpResponseCode_utils_1.HttpResCode.UNAUTHORIZED);
        }
        console.log('Admin authenticated successfully');
        const accessToken = this.jwtService.generateAccessToken(admin._id.toString(), 'admin');
        const refreshToken = this.jwtService.generateRefreshToken(admin._id.toString(), 'admin');
        return new auth_dto_1.AuthResponseDTO(accessToken, refreshToken, {
            id: admin._id.toString(),
            email: admin.email,
            name: admin.name,
            phone: admin.phone || 0,
            profileImage: admin.profileImage,
            role: admin.role,
        });
    }
};
exports.LoginAdminUseCase = LoginAdminUseCase;
exports.LoginAdminUseCase = LoginAdminUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IUserRepository')),
    __param(1, (0, tsyringe_1.inject)('JwtService')),
    __metadata("design:paramtypes", [Object, jwt_service_1.JwtService])
], LoginAdminUseCase);
