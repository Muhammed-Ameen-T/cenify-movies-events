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
exports.RefreshTokenUseCase = void 0;
// src/application/usecases/auth/refreshToken.usecase.ts
const tsyringe_1 = require("tsyringe");
const custom_error_1 = require("../../../utils/errors/custom.error");
const commonErrorMsg_constants_1 = __importDefault(require("../../../utils/constants/commonErrorMsg.constants"));
const httpResponseCode_utils_1 = require("../../../utils/constants/httpResponseCode.utils");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
let RefreshTokenUseCase = class RefreshTokenUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(refreshToken) {
        if (!refreshToken) {
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.AUTHENTICATION.INVALID_REFRESH_TOKEN, httpResponseCode_utils_1.HttpResCode.UNAUTHORIZED);
        }
        const decoded = jsonwebtoken_1.default.decode(refreshToken);
        if (!decoded || !decoded.exp || Date.now() >= decoded.exp * 1000) {
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.AUTHENTICATION.INVALID_REFRESH_TOKEN, httpResponseCode_utils_1.HttpResCode.UNAUTHORIZED);
        }
        const jwtService = tsyringe_1.container.resolve('JwtService');
        const verifiedDecoded = jwtService.verifyRefreshToken(refreshToken);
        const user = await this.userRepository.findById(verifiedDecoded.userId);
        if (!user) {
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.AUTHENTICATION.USER_NOT_FOUND, httpResponseCode_utils_1.HttpResCode.NOT_FOUND);
        }
        const newAccessToken = jwtService.generateAccessToken(user._id.toString(), user.role);
        return newAccessToken;
    }
};
exports.RefreshTokenUseCase = RefreshTokenUseCase;
exports.RefreshTokenUseCase = RefreshTokenUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IUserRepository')),
    __metadata("design:paramtypes", [Object])
], RefreshTokenUseCase);
