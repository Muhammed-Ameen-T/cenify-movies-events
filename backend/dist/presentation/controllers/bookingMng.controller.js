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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingMngController = void 0;
require("reflect-metadata");
const tsyringe_1 = require("tsyringe");
const sendResponse_utils_1 = require("../../utils/response/sendResponse.utils");
const httpResponseCode_utils_1 = require("../../utils/constants/httpResponseCode.utils");
const custom_error_1 = require("../../utils/errors/custom.error");
const booking_dto_1 = require("../../application/dtos/booking.dto");
const checkoutPayment_service_1 = require("../../infrastructure/services/checkoutPayment.service");
let BookingMngController = class BookingMngController {
    constructor(createBookingUseCase, fetchBookingsUseCase, findBookingByIdUseCase, cancelBookingUseCase, findBookingsOfUserUseCase, findBookingsOfVendorUseCase, paymentService, walletRepository, moviePassRepository) {
        this.createBookingUseCase = createBookingUseCase;
        this.fetchBookingsUseCase = fetchBookingsUseCase;
        this.findBookingByIdUseCase = findBookingByIdUseCase;
        this.cancelBookingUseCase = cancelBookingUseCase;
        this.findBookingsOfUserUseCase = findBookingsOfUserUseCase;
        this.findBookingsOfVendorUseCase = findBookingsOfVendorUseCase;
        this.paymentService = paymentService;
        this.walletRepository = walletRepository;
        this.moviePassRepository = moviePassRepository;
    }
    async createBooking(req, res, next) {
        try {
            const userId = req.decoded?.userId;
            if (!userId) {
                throw new custom_error_1.CustomError(httpResponseCode_utils_1.HttpResMsg.UNAUTHORIZED, httpResponseCode_utils_1.HttpResCode.UNAUTHORIZED);
            }
            const dto = new booking_dto_1.CreateBookingDTO(req.body.showId, userId, req.body.bookedSeatsId, req.body.payment, req.body.subTotal, req.body.convenienceFee, req.body.donation, req.body.totalAmount, req.body.couponDiscount, req.body.couponApplied, req.body.moviePassApplied, req.body.moviePassDiscount, new Date(Date.now() + 5 * 60 * 1000));
            const result = await this.createBookingUseCase.execute(dto);
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, httpResponseCode_utils_1.HttpResMsg.SUCCESS, result);
        }
        catch (error) {
            next(error);
        }
    }
    async checkPaymentOptions(req, res, next) {
        try {
            const userId = req.decoded?.userId;
            if (!userId) {
                throw new custom_error_1.CustomError(httpResponseCode_utils_1.HttpResMsg.UNAUTHORIZED, httpResponseCode_utils_1.HttpResCode.UNAUTHORIZED);
            }
            const totalAmount = parseFloat(req.query.totalAmount);
            if (isNaN(totalAmount)) {
                throw new custom_error_1.CustomError('Invalid total amount', httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            const hasSufficientWalletBalance = await this.paymentService.checkWalletBalance(userId, totalAmount);
            const hasMoviePass = await this.moviePassRepository.findByUserId(userId);
            const isMoviePassActive = hasMoviePass && hasMoviePass.status === 'Active';
            const wallet = await this.walletRepository.findByUserId(userId);
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, httpResponseCode_utils_1.HttpResMsg.SUCCESS, {
                wallet: { enabled: hasSufficientWalletBalance, balance: wallet?.balance || 0 },
                stripe: { enabled: true },
                moviePass: { active: isMoviePassActive },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async fetchBookings(req, res, next) {
        try {
            const { page, limit, search, status, sortBy, sortOrder } = req.query;
            // Convert query parameters
            const params = {
                page: page ? parseInt(page) : undefined,
                limit: limit ? parseInt(limit) : undefined,
                search: search ? search : undefined,
                status: status ? status.split(',') : undefined,
                sortBy: sortBy ? sortBy : undefined,
                sortOrder: sortOrder ? sortOrder : undefined,
            };
            const result = await this.fetchBookingsUseCase.execute(params);
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, httpResponseCode_utils_1.HttpResMsg.SUCCESS, result);
        }
        catch (error) {
            next(error);
        }
    }
    async findBookingsOfVendor(req, res, next) {
        try {
            const { page, limit, status, sortBy, sortOrder } = req.query;
            const vendorId = req.decoded?.userId;
            if (!vendorId) {
                throw new custom_error_1.CustomError(httpResponseCode_utils_1.HttpResMsg.UNAUTHORIZED, httpResponseCode_utils_1.HttpResCode.UNAUTHORIZED);
            }
            // Convert query parameters
            const params = {
                vendorId: vendorId,
                page: page ? parseInt(page) : undefined,
                limit: limit ? parseInt(limit) : undefined,
                status: status ? status.split(',') : undefined,
                sortBy: sortBy ? sortBy : undefined,
                sortOrder: sortOrder ? sortOrder : undefined,
            };
            const result = await this.findBookingsOfVendorUseCase.execute(params);
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, httpResponseCode_utils_1.HttpResMsg.SUCCESS, result);
        }
        catch (error) {
            next(error);
        }
    }
    async findBookingById(req, res, next) {
        try {
            const { id } = req.params;
            if (!id) {
                throw new custom_error_1.CustomError('Missing booking ID', httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            const booking = await this.findBookingByIdUseCase.execute(id);
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, httpResponseCode_utils_1.HttpResMsg.SUCCESS, booking);
        }
        catch (error) {
            next(error);
        }
    }
    async findBookingsOfUser(req, res, next) {
        try {
            const { page, limit, status, sortBy, sortOrder } = req.query;
            const userId = req.decoded?.userId;
            if (!userId) {
                throw new custom_error_1.CustomError(httpResponseCode_utils_1.HttpResMsg.UNAUTHORIZED, httpResponseCode_utils_1.HttpResCode.UNAUTHORIZED);
            }
            // Convert query parameters
            const params = {
                userId: userId,
                page: page ? parseInt(page) : undefined,
                limit: limit ? parseInt(limit) : undefined,
                status: status ? status.split(',') : undefined,
                sortBy: sortBy ? sortBy : undefined,
                sortOrder: sortOrder ? sortOrder : undefined,
            };
            const result = await this.findBookingsOfUserUseCase.execute(params);
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, httpResponseCode_utils_1.HttpResMsg.SUCCESS, result);
        }
        catch (error) {
            next(error);
        }
    }
    async cancelBooking(req, res, next) {
        try {
            const { id } = req.params;
            const { reason } = req.body;
            if (!id) {
                throw new custom_error_1.CustomError('Missing booking ID', httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            const cancelledBooking = await this.cancelBookingUseCase.execute(id, reason);
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, httpResponseCode_utils_1.HttpResMsg.SUCCESS, cancelledBooking);
        }
        catch (error) {
            next(error);
        }
    }
};
exports.BookingMngController = BookingMngController;
exports.BookingMngController = BookingMngController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('CreateBookingUseCase')),
    __param(1, (0, tsyringe_1.inject)('FetchAllBookingsUseCase')),
    __param(2, (0, tsyringe_1.inject)('FindBookingByIdUseCase')),
    __param(3, (0, tsyringe_1.inject)('CancelBookingUseCase')),
    __param(4, (0, tsyringe_1.inject)('FindBookingsOfUserUseCase')),
    __param(5, (0, tsyringe_1.inject)('FindBookingsOfVendorUseCase')),
    __param(6, (0, tsyringe_1.inject)('PaymentService')),
    __param(7, (0, tsyringe_1.inject)('WalletRepository')),
    __param(8, (0, tsyringe_1.inject)('MoviePassRepository')),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, checkoutPayment_service_1.PaymentService, Object, Object])
], BookingMngController);
