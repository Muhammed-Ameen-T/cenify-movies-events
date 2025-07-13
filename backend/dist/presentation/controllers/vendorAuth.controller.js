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
exports.VendorAuthController = void 0;
// src/presentation/controllers/theaterAuth.controller.ts
require("reflect-metadata");
const tsyringe_1 = require("tsyringe");
const sendResponse_utils_1 = require("../../utils/response/sendResponse.utils");
const httpResponseCode_utils_1 = require("../../utils/constants/httpResponseCode.utils");
const commonErrorMsg_constants_1 = __importDefault(require("../../utils/constants/commonErrorMsg.constants"));
const vendor_dto_1 = require("../../application/dtos/vendor.dto");
const commonSuccessMsg_constants_1 = require("../../utils/constants/commonSuccessMsg.constants");
let VendorAuthController = class VendorAuthController {
    constructor(sendOtpUseCase, verifyOtpUseCase, loginVendorUseCase, createTheaterUseCase, vendorRepository) {
        this.sendOtpUseCase = sendOtpUseCase;
        this.verifyOtpUseCase = verifyOtpUseCase;
        this.loginVendorUseCase = loginVendorUseCase;
        this.createTheaterUseCase = createTheaterUseCase;
        this.vendorRepository = vendorRepository;
    }
    async sendOtp(req, res, next) {
        try {
            const { email } = req.body;
            const dto = new vendor_dto_1.SendOtpVendorDTO(email);
            dto.email = email.trim();
            await this.sendOtpUseCase.execute(dto);
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, 'OTP sent successfully.');
        }
        catch (error) {
            next(error);
        }
    }
    async verifyOtp(req, res, next) {
        try {
            const { name, email, password, phone, accountType, otp } = req.body;
            const dto = new vendor_dto_1.VerifyOtpVendorDTO(name, email, password, phone, otp);
            const result = await this.verifyOtpUseCase.execute(dto);
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
            const dto = new vendor_dto_1.LoginVendorDTO(email, password);
            const result = await this.loginVendorUseCase.execute(dto);
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000,
            });
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, commonSuccessMsg_constants_1.SuccessMsg.USER_LOGGED_IN, {
                accessToken: result.accessToken,
                user: result.user,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async createNewTheater(req, res, next) {
        try {
            const vendorId = req.decoded?.userId;
            const { name, location, facilities, intervalTime, gallery, email, phone, description } = req.body;
            const dto = new vendor_dto_1.TheaterDetailsDTO(name, location, facilities, intervalTime, gallery, email, phone, description, vendorId);
            const theater = await this.createTheaterUseCase.execute(dto);
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, 'Theater details updated successfully.', theater);
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
            const jwtService = tsyringe_1.container.resolve('JwtService');
            const decoded = jwtService.verifyAccessToken(token);
            const theater = await this.vendorRepository.findById(decoded.userId);
            if (!theater) {
                (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.NOT_FOUND, commonErrorMsg_constants_1.default.AUTHENTICATION.USER_NOT_FOUND);
                return;
            }
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, httpResponseCode_utils_1.HttpResMsg.SUCCESS, {
                id: theater._id,
                name: theater.name,
                email: theater.email,
                phone: theater.phone || 0,
                profileImage: theater.gallery?.[0] || '',
            });
        }
        catch (error) {
            next(error);
        }
    }
};
exports.VendorAuthController = VendorAuthController;
exports.VendorAuthController = VendorAuthController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('SendOtpVendorUseCase')),
    __param(1, (0, tsyringe_1.inject)('VerifyOtpVendorUseCase')),
    __param(2, (0, tsyringe_1.inject)('LoginVendorUseCase')),
    __param(3, (0, tsyringe_1.inject)('CreateTheaterUseCase')),
    __param(4, (0, tsyringe_1.inject)('TheaterRepository')),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], VendorAuthController);
