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
exports.CancelBookingUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const custom_error_1 = require("../../../utils/errors/custom.error");
const httpResponseCode_utils_1 = require("../../../utils/constants/httpResponseCode.utils");
const commonErrorMsg_constants_1 = __importDefault(require("../../../utils/constants/commonErrorMsg.constants"));
const notification_entity_1 = require("../../../domain/entities/notification.entity");
const socket_service_1 = require("../../../infrastructure/services/socket.service");
let CancelBookingUseCase = class CancelBookingUseCase {
    constructor(bookingRepository, notificationRepository, walletRepository) {
        this.bookingRepository = bookingRepository;
        this.notificationRepository = notificationRepository;
        this.walletRepository = walletRepository;
    }
    async execute(bookingId, reason) {
        const existingBooking = await this.bookingRepository.findByBookingId(bookingId);
        if (!existingBooking) {
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.DATABASE.RECORD_NOT_FOUND, httpResponseCode_utils_1.HttpResCode.NOT_FOUND);
        }
        const show = existingBooking.showId;
        const theater = show.theaterId;
        if (!theater.facilities?.freeCancellation) {
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.VALIDATION.THEATER_NOT_PROVIDE_CANCELLATION, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
        }
        if (existingBooking.status === 'cancelled') {
            return existingBooking;
        }
        if (!existingBooking._id) {
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.DATABASE.RECORD_NOT_FOUND, httpResponseCode_utils_1.HttpResCode.NOT_FOUND);
        }
        const updatedBooking = await this.bookingRepository.cancelBooking(existingBooking._id.toString(), reason);
        if (!updatedBooking) {
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.GENERAL.FAILED_CANCELLING_BOOKING, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
        const notification = new notification_entity_1.Notification(null, existingBooking.userId._id.toString(), 'Booking Cancelled', 'booking', `Your booking ${bookingId} has been cancelled. If payment was completed, the amount has been refunded to your wallet`, null, new Date(), new Date(), false, false, []);
        await this.notificationRepository.createNotification(notification);
        socket_service_1.socketService.emitNotification(`user-${existingBooking.userId._id.toString()}`, notification);
        if (updatedBooking.payment.status === 'completed') {
            const cancellationFeePercentage = 15;
            const cancellationFee = (existingBooking.totalAmount * cancellationFeePercentage) / 100;
            const refundableAmount = existingBooking.totalAmount - cancellationFee;
            await this.walletRepository.pushTransactionAndUpdateBalance(existingBooking.userId._id.toString(), {
                amount: refundableAmount,
                remark: 'Booking Refund amount Credited to Wallet after charges.',
                type: 'credit',
                source: 'booking',
                createdAt: new Date(),
            });
        }
        return updatedBooking;
    }
};
exports.CancelBookingUseCase = CancelBookingUseCase;
exports.CancelBookingUseCase = CancelBookingUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('BookingRepository')),
    __param(1, (0, tsyringe_1.inject)('NotificationRepository')),
    __param(2, (0, tsyringe_1.inject)('WalletRepository')),
    __metadata("design:paramtypes", [Object, Object, Object])
], CancelBookingUseCase);
