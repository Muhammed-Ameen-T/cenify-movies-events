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
// src/presentation/controllers/userAuth.controller.ts
require("reflect-metadata");
const tsyringe_1 = require("tsyringe");
const sendResponse_utils_1 = require("../../utils/response/sendResponse.utils");
const httpResponseCode_utils_1 = require("../../utils/constants/httpResponseCode.utils");
const commonErrorMsg_constants_1 = __importDefault(require("../../utils/constants/commonErrorMsg.constants"));
const auth_dto_1 = require("../../application/dtos/auth.dto");
const commonSuccessMsg_constants_1 = require("../../utils/constants/commonSuccessMsg.constants");
/**
 * Controller for handling user authentication, including OTP-based registration, login,
 * Google authentication, token refreshing, and password reset functionalities.
 * @implements {IUserAuthController}
 */
let UserAuthController = class UserAuthController {
    /**
     * Constructs an instance of UserAuthController.
     * @param {ISendOtpUseCase} sendOtpUseCase - Use case for sending OTP to a user's email.
     * @param {IVerifyOtpUseCase} verifyOtpUseCase - Use case for verifying OTP and registering/logging in a user.
     * @param {IGoogleAuthUseCase} googleAuthUseCase - Use case for handling Google OAuth authentication.
     * @param {ILoginUserUseCase} loginUserUseCase - Use case for user login.
     * @param {IForgotPasswordSendOtpUseCase} forgotPassSendOtpUseCase - Use case for sending OTP for password reset.
     * @param {IForgotPasswordUpdateUseCase} forgotPassUpdatePassUseCase - Use case for updating password after OTP verification.
     * @param {IForgotPasswordVerifyOtpUseCase} forgotPassVerifyOtpUseCase - Use case for verifying OTP during password reset.
     * @param {IRefreshTokenUseCase} refreshTokenUseCase - Use case for creaeting new Access Token Using refreshToken.
     */
    constructor(sendOtpUseCase, verifyOtpUseCase, googleAuthUseCase, loginUserUseCase, forgotPassSendOtpUseCase, forgotPassUpdatePassUseCase, forgotPassVerifyOtpUseCase, refreshTokenUseCase) {
        this.sendOtpUseCase = sendOtpUseCase;
        this.verifyOtpUseCase = verifyOtpUseCase;
        this.googleAuthUseCase = googleAuthUseCase;
        this.loginUserUseCase = loginUserUseCase;
        this.forgotPassSendOtpUseCase = forgotPassSendOtpUseCase;
        this.forgotPassUpdatePassUseCase = forgotPassUpdatePassUseCase;
        this.forgotPassVerifyOtpUseCase = forgotPassVerifyOtpUseCase;
        this.refreshTokenUseCase = refreshTokenUseCase;
    }
    /**
     * Handles the Google OAuth callback, processes user data, generates tokens, and sets a refresh token cookie.
     * @param {Request} req - The Express request object, containing Google authentication data in the body.
     * @param {Response} res - The Express response object.
     * @param {NextFunction} next - The Express next middleware function.
     * @returns {Promise<void>}
     */
    async googleCallback(req, res, next) {
        try {
            const result = await this.googleAuthUseCase.execute(req.body);
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: parseInt(process.env.MAX_AGE || '0', 10),
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
    /**
     * Refreshes the access token using a provided refresh token from cookies.
     * @param {Request} req - The Express request object, expecting `refreshToken` in cookies.
     * @param {Response} res - The Express response object.
     * @param {NextFunction} next - The Express next middleware function.
     * @returns {Promise<void>}
     */
    async refreshToken(req, res, next) {
        try {
            const refreshToken = req.cookies.refreshToken;
            const newAccessToken = await this.refreshTokenUseCase.execute(refreshToken);
            // Send new token response
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, httpResponseCode_utils_1.HttpResMsg.SUCCESS, { accessToken: newAccessToken });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Retrieves details of the currently authenticated user based on their access token.
     * @param {Request} req - The Express request object, expecting an Authorization header with a Bearer token.
     * @param {Response} res - The Express response object.
     * @param {NextFunction} next - The Express next middleware function.
     * @returns {Promise<void>}
     */
    // async getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    //   const token = req.headers.authorization?.split(' ')[1];
    //   if (!token) {
    //     sendResponse(res, HttpResCode.UNAUTHORIZED, ERROR_MESSAGES.AUTHENTICATION.UNAUTHORIZED);
    //     return;
    //   }
    //   try {
    //     const jwtService = container.resolve<JwtService>('JwtService');
    //     const decoded = jwtService.verifyAccessToken(token);
    //     const user = await this.getUserDetailsUseCase.execute(decoded.userId);
    //     if (!user) {
    //       sendResponse(res, HttpResCode.NOT_FOUND, ERROR_MESSAGES.AUTHENTICATION.USER_NOT_FOUND);
    //       return;
    //     }
    //     sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, {
    //       id: user._id?.toString() || '',
    //       name: user.name,
    //       email: user.email,
    //       phone: user.phone ? user.phone : 'N/A',
    //       profileImage: user.profileImage,
    //       role: user.role,
    //       loyalityPoints: user.loyalityPoints || 0,
    //       dateOfBirth: user.dob ? user.dob : 'N/A',
    //       joinedDate: user.createdAt.toDateString(),
    //     });
    //   } catch (error) {
    //     next(error);
    //   }
    // }
    /**
     * Sends an OTP to the provided email address for user registration or verification.
     * @param {Request} req - The Express request object, containing `email` in the body.
     * @param {Response} res - The Express response object.
     * @param {NextFunction} next - The Express next middleware function.
     * @returns {Promise<void>}
     */
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
    /**
     * Verifies the OTP and completes user registration or login, setting a refresh token cookie.
     * @param {Request} req - The Express request object, containing `name`, `email`, `password`, and `otp` in the body.
     * @param {Response} res - The Express response object.
     * @param {NextFunction} next - The Express next middleware function.
     * @returns {Promise<void>}
     */
    async verifyOtp(req, res, next) {
        try {
            const { name, email, password, otp } = req.body;
            const dto = new auth_dto_1.VerifyOtpDTO(name, email, otp, password);
            const result = await this.verifyOtpUseCase.execute(dto);
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: parseInt(process.env.MAX_AGE || '0', 10),
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
    /**
     * Handles user login, authenticates credentials, and sets a refresh token cookie.
     * @param {Request} req - The Express request object, containing `email` and `password` in the body.
     * @param {Response} res - The Express response object.
     * @param {NextFunction} next - The Express next middleware function.
     * @returns {Promise<void>}
     */
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const dto = new auth_dto_1.LoginDTO(email, password);
            const response = await this.loginUserUseCase.execute(dto);
            res.cookie('refreshToken', response.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: parseInt(process.env.MAX_AGE || '0', 10),
            });
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, commonSuccessMsg_constants_1.SuccessMsg.USER_LOGGED_IN, {
                accessToken: response.accessToken,
                user: response.user,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Logs out the user by clearing the refresh token cookie.
     * @param {Request} req - The Express request object.
     * @param {Response} res - The Express response object.
     * @param {NextFunction} next - The Express next middleware function.
     * @returns {Promise<void>}
     */
    async logout(req, res, next) {
        try {
            res.clearCookie('refreshToken');
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, commonSuccessMsg_constants_1.SuccessMsg.USER_LOGGED_OUT);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Sends an OTP to the user's email for a forgotten password reset process.
     * @param {Request} req - The Express request object, containing `email` in the body.
     * @param {Response} res - The Express response object.
     * @param {NextFunction} next - The Express next middleware function.
     * @returns {Promise<void>}
     */
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
    /**
     * Verifies the OTP provided by the user for a forgotten password reset.
     * @param {Request} req - The Express request object, containing `email` and `otp` in the body.
     * @param {Response} res - The Express response object.
     * @param {NextFunction} next - The Express next middleware function.
     * @returns {Promise<void>}
     */
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
    /**
     * Updates the user's password after successful OTP verification during the forgotten password process.
     * @param {Request} req - The Express request object, containing `email` and `password` in the body.
     * @param {Response} res - The Express response object.
     * @param {NextFunction} next - The Express next middleware function.
     * @returns {Promise<void>}
     */
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
    __param(7, (0, tsyringe_1.inject)('RefreshTokenUseCase')),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object])
], UserAuthController);
