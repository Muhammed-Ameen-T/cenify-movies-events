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
exports.UserProfileController = void 0;
// src/presentation/controllers/auth.controller.ts
require("reflect-metadata");
const tsyringe_1 = require("tsyringe");
const sendResponse_utils_1 = require("../../utils/response/sendResponse.utils");
const httpResponseCode_utils_1 = require("../../utils/constants/httpResponseCode.utils");
const commonErrorMsg_constants_1 = __importDefault(require("../../utils/constants/commonErrorMsg.constants"));
const user_dto_1 = require("../../application/dtos/user.dto");
const profile_dto_1 = require("../../application/dtos/profile.dto");
let UserProfileController = class UserProfileController {
    constructor(getUserDetailsUseCase, updateUserDetailsUseCase, findUserWalletUseCase, changePasswordUseCase, findWalletTransaction, redeemLoyalityToWalletUseCase, bookingRepository, walletRepository, moviePassRepository, sendOtpPhoneUseCase, verifyOtpPhoneUseCase) {
        this.getUserDetailsUseCase = getUserDetailsUseCase;
        this.updateUserDetailsUseCase = updateUserDetailsUseCase;
        this.findUserWalletUseCase = findUserWalletUseCase;
        this.changePasswordUseCase = changePasswordUseCase;
        this.findWalletTransaction = findWalletTransaction;
        this.redeemLoyalityToWalletUseCase = redeemLoyalityToWalletUseCase;
        this.bookingRepository = bookingRepository;
        this.walletRepository = walletRepository;
        this.moviePassRepository = moviePassRepository;
        this.sendOtpPhoneUseCase = sendOtpPhoneUseCase;
        this.verifyOtpPhoneUseCase = verifyOtpPhoneUseCase;
    }
    async getCurrentUser(req, res, next) {
        try {
            const userId = req.decoded?.userId;
            if (!userId) {
                (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.UNAUTHORIZED, commonErrorMsg_constants_1.default.AUTHENTICATION.UNAUTHORIZED);
                return;
            }
            const user = await this.getUserDetailsUseCase.execute(userId);
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
    async updateUserProfile(req, res, next) {
        const userId = req.decoded?.userId;
        if (!userId) {
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.UNAUTHORIZED, commonErrorMsg_constants_1.default.AUTHENTICATION.UNAUTHORIZED);
            return;
        }
        try {
            const updateData = new user_dto_1.UpdateProfileRequestDTO(req.body.name, req.body.phone !== undefined ? Number(req.body.phone) : undefined, req.body.profileImage, req.body.dob == 'N/A' ? null : new Date(req.body.dob));
            const userResponse = await this.updateUserDetailsUseCase.execute(userId, updateData);
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, httpResponseCode_utils_1.HttpResMsg.SUCCESS, { userResponse });
        }
        catch (error) {
            next(error);
        }
    }
    async findUserWallet(req, res, next) {
        const userId = req.decoded?.userId;
        if (!userId) {
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.UNAUTHORIZED, commonErrorMsg_constants_1.default.AUTHENTICATION.UNAUTHORIZED);
            return;
        }
        try {
            const wallet = await this.findUserWalletUseCase.execute(userId);
            if (!wallet) {
                (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.NOT_FOUND, commonErrorMsg_constants_1.default.GENERAL.WALLET_NOT_FOUND);
                return;
            }
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, httpResponseCode_utils_1.HttpResMsg.SUCCESS, { wallet });
        }
        catch (error) {
            next(error);
        }
    }
    async findProfileContents(req, res, next) {
        const userId = req.decoded?.userId;
        if (!userId) {
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.UNAUTHORIZED, commonErrorMsg_constants_1.default.AUTHENTICATION.UNAUTHORIZED);
            return;
        }
        try {
            let walletBalance = await this.walletRepository.walletbalance(userId);
            if (!walletBalance) {
                walletBalance = 0;
            }
            const bookingsCount = await this.bookingRepository.countBookings(userId);
            const moviePass = await this.moviePassRepository.findByUserId(userId);
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, httpResponseCode_utils_1.HttpResMsg.SUCCESS, {
                walletBalance,
                bookingsCount,
                moviePass,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async changePassword(req, res, next) {
        const userId = req.decoded?.userId;
        if (!userId) {
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.UNAUTHORIZED, commonErrorMsg_constants_1.default.AUTHENTICATION.UNAUTHORIZED);
            return;
        }
        try {
            const dto = new user_dto_1.ChangePasswordRequestDTO(userId, req.body.oldPassword, req.body.newPassword);
            const userResponse = await this.changePasswordUseCase.execute(dto);
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, httpResponseCode_utils_1.HttpResMsg.SUCCESS, { userResponse });
        }
        catch (error) {
            next(error);
        }
    }
    async findUserWalletTransactions(req, res, next) {
        const userId = req.decoded?.userId;
        if (!userId) {
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.UNAUTHORIZED, commonErrorMsg_constants_1.default.AUTHENTICATION.UNAUTHORIZED);
            return;
        }
        const { page = '1', limit = '5', filter = 'all' } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const validFilters = ['all', 'credit', 'debit'];
        const filterValue = validFilters.includes(filter)
            ? filter
            : 'all';
        if (isNaN(pageNum) || pageNum < 1 || isNaN(limitNum) || limitNum < 1) {
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST, commonErrorMsg_constants_1.default.VALIDATION.INVALID_PAGINATION_PARAMS);
            return;
        }
        try {
            const result = await this.findWalletTransaction.execute(userId, pageNum, limitNum, filterValue);
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, httpResponseCode_utils_1.HttpResMsg.SUCCESS, result);
        }
        catch (error) {
            next(error);
        }
    }
    async redeemLoyaltyPoints(req, res, next) {
        const userId = req.decoded?.userId;
        if (!userId) {
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.UNAUTHORIZED, commonErrorMsg_constants_1.default.AUTHENTICATION.UNAUTHORIZED);
            return;
        }
        try {
            const { amount } = req.body;
            // Validate amount
            if (!amount || isNaN(amount) || amount <= 0) {
                (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST, commonErrorMsg_constants_1.default.VALIDATION.INVALID_INPUT);
                return;
            }
            const walletResponse = await this.redeemLoyalityToWalletUseCase.execute(userId, amount);
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, httpResponseCode_utils_1.HttpResMsg.SUCCESS, { walletResponse });
        }
        catch (error) {
            next(error);
        }
    }
    async sendOtpPhone(req, res, next) {
        const userId = req.decoded?.userId;
        if (!userId) {
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.UNAUTHORIZED, commonErrorMsg_constants_1.default.AUTHENTICATION.UNAUTHORIZED);
            return;
        }
        try {
            const { phone } = req.body;
            const dto = new profile_dto_1.SendOtpPhoneRequestDTO(phone, userId);
            if (!phone || !/^\d{10}$/.test(phone)) {
                (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST, commonErrorMsg_constants_1.default.VALIDATION.INVALID_PHONE);
                return;
            }
            await this.sendOtpPhoneUseCase.execute(dto);
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, httpResponseCode_utils_1.HttpResMsg.SUCCESS, { message: 'OTP sent successfully' });
        }
        catch (error) {
            next(error);
        }
    }
    async verifyOtpPhone(req, res, next) {
        const userId = req.decoded?.userId;
        if (!userId) {
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.UNAUTHORIZED, commonErrorMsg_constants_1.default.AUTHENTICATION.UNAUTHORIZED);
            return;
        }
        try {
            const { phone, otp } = req.body;
            const dto = new profile_dto_1.VerifyOtpPhoneRequestDTO(phone, otp, userId);
            if (!phone || !otp) {
                (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST, commonErrorMsg_constants_1.default.VALIDATION.INVALID_INPUT);
                return;
            }
            await this.verifyOtpPhoneUseCase.execute(dto);
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, httpResponseCode_utils_1.HttpResMsg.SUCCESS, { message: 'OTP verified successfully' });
        }
        catch (error) {
            next(error);
        }
    }
};
exports.UserProfileController = UserProfileController;
exports.UserProfileController = UserProfileController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('GetUserDetailsUseCase')),
    __param(1, (0, tsyringe_1.inject)('UpdateUserProfileUseCase')),
    __param(2, (0, tsyringe_1.inject)('FindUserWalletUseCase')),
    __param(3, (0, tsyringe_1.inject)('ChangePasswordUseCase')),
    __param(4, (0, tsyringe_1.inject)('WalletTransactionUseCase')),
    __param(5, (0, tsyringe_1.inject)('RedeemLoyalityToWalletUseCase')),
    __param(6, (0, tsyringe_1.inject)('BookingRepository')),
    __param(7, (0, tsyringe_1.inject)('WalletRepository')),
    __param(8, (0, tsyringe_1.inject)('MoviePassRepository')),
    __param(9, (0, tsyringe_1.inject)('SendOtpPhoneUseCase')),
    __param(10, (0, tsyringe_1.inject)('VerifyOtpPhoneUseCase')),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], UserProfileController);
