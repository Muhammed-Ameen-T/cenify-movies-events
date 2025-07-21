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
exports.LoginVendorUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const auth_dto_1 = require("../../dtos/auth.dto");
const jwt_service_1 = require("../../../infrastructure/services/jwt.service");
const custom_error_1 = require("../../../utils/errors/custom.error");
const httpResponseCode_utils_1 = require("../../../utils/constants/httpResponseCode.utils");
const commonErrorMsg_constants_1 = __importDefault(require("../../../utils/constants/commonErrorMsg.constants"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
let LoginVendorUseCase = class LoginVendorUseCase {
    constructor(userRepository, jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }
    async execute(dto) {
        const vendor = await this.userRepository.findByEmail(dto.email);
        if (!vendor) {
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.AUTHENTICATION.USER_NOT_FOUND, httpResponseCode_utils_1.HttpResCode.UNAUTHORIZED);
        }
        if (vendor.isBlocked) {
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.AUTHENTICATION.BLOCKED_USER, httpResponseCode_utils_1.HttpResCode.UNAUTHORIZED);
        }
        if (vendor.role !== 'vendor') {
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.AUTHENTICATION.YOUR_NOT_VENDOR, httpResponseCode_utils_1.HttpResCode.UNAUTHORIZED);
        }
        const isMatch = await bcryptjs_1.default.compare(dto.password, vendor.password);
        if (!isMatch) {
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.PASSWORD_MISMATCH, httpResponseCode_utils_1.HttpResCode.UNAUTHORIZED);
        }
        const accessToken = this.jwtService.generateAccessToken(vendor._id.toString(), vendor.role);
        const refreshToken = this.jwtService.generateRefreshToken(vendor._id.toString(), vendor.role);
        return new auth_dto_1.AuthResponseDTO(accessToken, refreshToken, {
            id: vendor._id.toString(),
            email: vendor.email,
            name: vendor.name,
            phone: vendor.phone,
            profileImage: vendor.profileImage,
            role: vendor.role,
        });
    }
};
exports.LoginVendorUseCase = LoginVendorUseCase;
exports.LoginVendorUseCase = LoginVendorUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IUserRepository')),
    __param(1, (0, tsyringe_1.inject)('JwtService')),
    __metadata("design:paramtypes", [Object, jwt_service_1.JwtService])
], LoginVendorUseCase);
