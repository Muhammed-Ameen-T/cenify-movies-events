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
exports.UserAuthController = void 0;
// src/presentation/controllers/auth.controller.ts
require("reflect-metadata");
const tsyringe_1 = require("tsyringe");
const tsyringe_2 = require("tsyringe");
const sendResponse_utils_1 = require("../../utils/response/sendResponse.utils");
const httpResponseCode_utils_1 = require("../../utils/constants/httpResponseCode.utils");
const commonErrorMsg_constants_1 = __importDefault(require("../../utils/constants/commonErrorMsg.constants"));
const auth_dto_1 = require("../../application/dtos/auth.dto");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const commonSuccessMsg_constants_1 = require("../../utils/constants/commonSuccessMsg.constants");
let UserAuthController = class UserAuthController {
    constructor(sendOtpUseCase, verifyOtpUseCase, googleAuthUseCase, loginUserUseCase, forgotPassSendOtpUseCase, forgotPassUpdatePassUseCase, forgotPassVerifyOtpUseCase, getUserDetailsUseCase, userRepository) {
        this.sendOtpUseCase = sendOtpUseCase;
        this.verifyOtpUseCase = verifyOtpUseCase;
        this.googleAuthUseCase = googleAuthUseCase;
        this.loginUserUseCase = loginUserUseCase;
        this.forgotPassSendOtpUseCase = forgotPassSendOtpUseCase;
        this.forgotPassUpdatePassUseCase = forgotPassUpdatePassUseCase;
        this.forgotPassVerifyOtpUseCase = forgotPassVerifyOtpUseCase;
        this.getUserDetailsUseCase = getUserDetailsUseCase;
        this.userRepository = userRepository;
    }
    async googleCallback(req, res, next) {
        try {
            const result = await this.googleAuthUseCase.execute(req.body);
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, httpResponseCode_utils_1.HttpResMsg.SUCCESS, {
                accessToken: result.accessToken,
                user: result.user,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async refreshToken(req, res, next) {
        try {
            if (!req.cookies.refreshToken) {
                (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.UNAUTHORIZED, commonErrorMsg_constants_1.default.AUTHENTICATION.INVALID_REFRESH_TOKEN);
                return;
            }
            const refreshToken = req.cookies.refreshToken;
            // Decode first to check expiration
            const decoded = jsonwebtoken_1.default.decode(refreshToken);
            if (!decoded || !decoded.exp || Date.now() >= decoded.exp * 1000) {
                (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.UNAUTHORIZED, commonErrorMsg_constants_1.default.AUTHENTICATION.INVALID_REFRESH_TOKEN);
                return;
            }
            // Verify token
            const jwtService = tsyringe_2.container.resolve('JwtService');
            const verifiedDecoded = jwtService.verifyRefreshToken(refreshToken);
            // const authRepository = container.resolve<IAuthRepository>('AuthRepository');
            const user = await this.userRepository.findById(verifiedDecoded.userId);
            if (!user) {
                (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.NOT_FOUND, commonErrorMsg_constants_1.default.AUTHENTICATION.USER_NOT_FOUND);
                return;
            }
            // Generate new access token
            const newAccessToken = jwtService.generateAccessToken(user._id.toString(), user.role);
            // Send new token response
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, httpResponseCode_utils_1.HttpResMsg.SUCCESS, { accessToken: newAccessToken });
        }
        catch (error) {
            next(error);
        }
    }
    async getCurrentUser(req, res, next) {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.UNAUTHORIZED, commonErrorMsg_constants_1.default.AUTHENTICATION.UNAUTHORIZED);
            return;
        }
        try {
            const jwtService = tsyringe_2.container.resolve('JwtService');
            const decoded = jwtService.verifyAccessToken(token);
            const user = await this.getUserDetailsUseCase.execute(decoded.userId);
            if (!user) {
                (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.NOT_FOUND, commonErrorMsg_constants_1.default.AUTHENTICATION.USER_NOT_FOUND);
                return;
            }
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, httpResponseCode_utils_1.HttpResMsg.SUCCESS, {
                id: user._id?.toString() || '',
                name: user.name,
                email: user.email,
                phone: user.phone ? user.phone : 'N/A',
                profileImage: user.profileImage,
                role: user.role,
                loyalityPoints: user.loyalityPoints || 0,
                dateOfBirth: user.dob ? user.dob : 'N/A',
                joinedDate: user.createdAt.toDateString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    async sendOtp(req, res, next) {
        try {
            const { email } = req.body;
            if (!email || typeof email !== 'string' || !email.trim()) {
                (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST, commonErrorMsg_constants_1.default.VALIDATION.EMAIL_FORMAT_INVALID);
                return;
            }
            await this.sendOtpUseCase.execute(email.trim());
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, commonSuccessMsg_constants_1.SuccessMsg.OTP_SENT);
        }
        catch (error) {
            next(error);
        }
    }
    async verifyOtp(req, res, next) {
        try {
            const { name, email, password, otp } = req.body;
            const dto = new auth_dto_1.VerifyOtpDTO(name, email, otp, password);
            const result = await this.verifyOtpUseCase.execute(dto);
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, commonSuccessMsg_constants_1.SuccessMsg.USER_REGISTERED, {
                accessToken: result.accessToken,
                user: result.user,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const dto = new auth_dto_1.LoginDTO(email, password);
            const response = await this.loginUserUseCase.execute(dto);
            res.cookie('refreshToken', response.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, commonSuccessMsg_constants_1.SuccessMsg.USER_LOGGED_IN, {
                accessToken: response.accessToken,
                user: response.user,
            });
        }
        catch (error) {
            console.log("🚀 ~ UserAuthController ~ login ~ error:", error);
            next(error);
        }
    }
    async logout(req, res, next) {
        try {
            res.clearCookie('refreshToken');
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, commonSuccessMsg_constants_1.SuccessMsg.USER_LOGGED_OUT);
        }
        catch (error) {
            next(error);
        }
    }
    async forgotPassSendOtp(req, res, next) {
        try {
            const { email } = req.body;
            await this.forgotPassSendOtpUseCase.execute(email.trim());
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, commonSuccessMsg_constants_1.SuccessMsg.OTP_SENT);
        }
        catch (error) {
            next(error);
        }
    }
    async forgotPassVerifyOtp(req, res, next) {
        try {
            const { email, otp } = req.body;
            await this.forgotPassVerifyOtpUseCase.execute(email, otp);
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, commonSuccessMsg_constants_1.SuccessMsg.OTP_VERIFIED);
        }
        catch (error) {
            next(error);
        }
    }
    async forgotPassUpdatePassword(req, res, next) {
        try {
            const { email, password } = req.body;
            await this.forgotPassUpdatePassUseCase.execute(email, password);
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, commonSuccessMsg_constants_1.SuccessMsg.PASSWORD_UPDATED);
        }
        catch (error) {
            next(error);
        }
    }
};
exports.UserAuthController = UserAuthController;
exports.UserAuthController = UserAuthController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('SendOtpUserUseCase')),
    __param(1, (0, tsyringe_1.inject)('VerifyOtpUserUseCase')),
    __param(2, (0, tsyringe_1.inject)('GoogleAuthUseCase')),
    __param(3, (0, tsyringe_1.inject)('LoginUserUseCase')),
    __param(4, (0, tsyringe_1.inject)('ForgotPassSendOtp')),
    __param(5, (0, tsyringe_1.inject)('ForgotPassUpdate')),
    __param(6, (0, tsyringe_1.inject)('ForgotPassVerifyOtp')),
    __param(7, (0, tsyringe_1.inject)('GetUserDetailsUseCase')),
    __param(8, (0, tsyringe_1.inject)('IUserRepository')),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object])
], UserAuthController);
