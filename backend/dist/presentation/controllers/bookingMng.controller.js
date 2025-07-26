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
exports.BookingMngController = void 0;
require("reflect-metadata");
const tsyringe_1 = require("tsyringe");
const sendResponse_utils_1 = require("../../utils/response/sendResponse.utils");
const httpResponseCode_utils_1 = require("../../utils/constants/httpResponseCode.utils");
const custom_error_1 = require("../../utils/errors/custom.error");
const booking_dto_1 = require("../../application/dtos/booking.dto");
const commonErrorMsg_constants_1 = __importDefault(require("../../utils/constants/commonErrorMsg.constants"));
/**
 * Controller for managing booking-related operations.
 * @implements {IBookingMngController}
 */
let BookingMngController = class BookingMngController {
    /**
     * Constructs an instance of BookingMngController.
     * @param {ICreateBookingUseCase} createBookingUseCase - Use case for creating a booking.
     * @param {IFetchAllBookingsUseCase} fetchBookingsUseCase - Use case for fetching all bookings.
     * @param {IFindBookingByIdUseCase} findBookingByIdUseCase - Use case for finding a booking by ID.
     * @param {ICancelBookingUseCase} cancelBookingUseCase - Use case for canceling a booking.
     * @param {IFindBookingsOfUserUseCase} findBookingsOfUserUseCase - Use case for finding bookings of a specific user.
     * @param {IFindBookingsOfVendorUseCase} findBookingsOfVendorUseCase - Use case for finding bookings of a specific vendor.
     * @param {ICheckPaymentOptionsUseCase} checkPaymentOptionsUseCase - Use case for checking payment options.
     */
    constructor(createBookingUseCase, fetchBookingsUseCase, findBookingByIdUseCase, cancelBookingUseCase, findBookingsOfUserUseCase, findBookingsOfVendorUseCase, checkPaymentOptionsUseCase) {
        this.createBookingUseCase = createBookingUseCase;
        this.fetchBookingsUseCase = fetchBookingsUseCase;
        this.findBookingByIdUseCase = findBookingByIdUseCase;
        this.cancelBookingUseCase = cancelBookingUseCase;
        this.findBookingsOfUserUseCase = findBookingsOfUserUseCase;
        this.findBookingsOfVendorUseCase = findBookingsOfVendorUseCase;
        this.checkPaymentOptionsUseCase = checkPaymentOptionsUseCase;
    }
    /**
     * Handles the creation of a new booking.
     * @param {Request} req - The Express request object.
     * @param {Response} res - The Express response object.
     * @param {NextFunction} next - The Express next middleware function.
     * @returns {Promise<void>}
     */
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
    /**
     * Checks available payment options for a given total amount.
     * @param {Request} req - The Express request object.
     * @param {Response} res - The Express response object.
     * @param {NextFunction} next - The Express next middleware function.
     * @returns {Promise<void>}
     */
    async checkPaymentOptions(req, res, next) {
        try {
            const userId = req.decoded?.userId;
            if (!userId) {
                throw new custom_error_1.CustomError(httpResponseCode_utils_1.HttpResMsg.UNAUTHORIZED, httpResponseCode_utils_1.HttpResCode.UNAUTHORIZED);
            }
            const totalAmount = parseFloat(req.query.totalAmount);
            if (isNaN(totalAmount)) {
                throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.INVALID_TOTAL_AMOUNT, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
            }
            const response = await this.checkPaymentOptionsUseCase.execute(userId, totalAmount);
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, httpResponseCode_utils_1.HttpResMsg.SUCCESS, response);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Fetches all bookings based on provided query parameters.
     * @param {Request} req - The Express request object.
     * @param {Response} res - The Express response object.
     * @param {NextFunction} next - The Express next middleware function.
     * @returns {Promise<void>}
     */
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
    /**
     * Finds bookings associated with a specific vendor.
     * @param {Request} req - The Express request object.
     * @param {Response} res - The Express response object.
     * @param {NextFunction} next - The Express next middleware function.
     * @returns {Promise<void>}
     */
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
    /**
     * Finds a specific booking by its ID.
     * @param {Request} req - The Express request object.
     * @param {Response} res - The Express response object.
     * @param {NextFunction} next - The Express next middleware function.
     * @returns {Promise<void>}
     */
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
    /**
     * Finds bookings associated with a specific user.
     * @param {Request} req - The Express request object.
     * @param {Response} res - The Express response object.
     * @param {NextFunction} next - The Express next middleware function.
     * @returns {Promise<void>}
     */
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
    /**
     * Cancels a booking by its ID.
     * @param {Request} req - The Express request object.
     * @param {Response} res - The Express response object.
     * @param {NextFunction} next - The Express next middleware function.
     * @returns {Promise<void>}
     */
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
    __param(6, (0, tsyringe_1.inject)('CheckPaymentOptionsUseCase')),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object])
], BookingMngController);
