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
exports.CreateBookingUseCase = void 0;
const tsyringe_1 = require("tsyringe");
const booking_entity_1 = require("../../../domain/entities/booking.entity");
const notification_entity_1 = require("../../../domain/entities/notification.entity");
const custom_error_1 = require("../../../utils/errors/custom.error");
const httpResponseCode_utils_1 = require("../../../utils/constants/httpResponseCode.utils");
const bookingIdGenerate_service_1 = require("../../../infrastructure/services/bookingIdGenerate.service");
const mongoose_1 = __importDefault(require("mongoose"));
const checkoutPayment_service_1 = require("../../../infrastructure/services/checkoutPayment.service");
const commonErrorMsg_constants_1 = __importDefault(require("../../../utils/constants/commonErrorMsg.constants"));
const socket_service_1 = require("../../../infrastructure/services/socket.service");
const showAgenda_service_1 = require("../../../infrastructure/services/showAgenda.service");
let CreateBookingUseCase = class CreateBookingUseCase {
    constructor(bookingRepository, notificationRepository, moviePassRepository, paymentService, seatRepository, showRepository, userRepository, showJobService) {
        this.bookingRepository = bookingRepository;
        this.notificationRepository = notificationRepository;
        this.moviePassRepository = moviePassRepository;
        this.paymentService = paymentService;
        this.seatRepository = seatRepository;
        this.showRepository = showRepository;
        this.userRepository = userRepository;
        this.showJobService = showJobService;
    }
    async execute(dto) {
        // Validate session timeout
        if (dto.expiresAt && new Date(dto.expiresAt) < new Date()) {
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.GENERAL.SESSION_EXPIRED, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
        }
        // Calculate movie pass discount
        let moviePassDiscount = 0;
        const hasMoviePass = await this.moviePassRepository.findByUserId(dto.userId);
        if (hasMoviePass && dto.moviePassApplied && hasMoviePass.status === 'Active') {
            moviePassDiscount = Math.round(dto.subTotal * 0.08); // 8% discount
            dto.moviePassApplied = true;
        }
        // Validate total amount
        const expectedTotal = dto.subTotal +
            dto.convenienceFee -
            moviePassDiscount -
            (dto.couponDiscount ? dto.couponDiscount : 0) +
            dto.donation;
        if (Math.abs(dto.totalAmount - expectedTotal) > 1) {
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.GENERAL.INVALID_TOTAL_AMOUNT, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
        }
        const totalDiscount = Math.round(moviePassDiscount + (dto.couponDiscount ? dto.couponDiscount : 0));
        const bookingId = bookingIdGenerate_service_1.BookingGenerateService.generateBookingId();
        const newQrCode = await bookingIdGenerate_service_1.BookingGenerateService.generateQrCode(bookingId);
        const newBooking = new booking_entity_1.Booking(null, new mongoose_1.default.Types.ObjectId(dto.showId), new mongoose_1.default.Types.ObjectId(dto.userId), dto.bookedSeatsId.map((seatId) => new mongoose_1.default.Types.ObjectId(seatId)), bookingId, 'confirmed', {
            ...dto.payment,
            status: 'pending',
        }, newQrCode, dto.subTotal, dto.couponDiscount || 0, dto.couponApplied || false, dto.convenienceFee, dto.donation, dto.moviePassApplied || false, moviePassDiscount, totalDiscount, dto.totalAmount, 0, dto.expiresAt, null, new Date(), new Date());
        await this.bookingRepository.create(newBooking);
        const savedBooking = await this.bookingRepository.findByBookingId(bookingId);
        if (!savedBooking) {
            throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.GENERAL.FAILED_CREATING_BOOKING, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
        }
        await this.moviePassRepository.incrementMovieStats(dto.userId, moviePassDiscount);
        // Process payment
        if (dto.payment.method === 'wallet') {
            await this.paymentService.deductWalletBalance(dto.userId, dto.totalAmount);
            if (!savedBooking._id) {
                throw new custom_error_1.CustomError('Booking ID is missing after creation.', httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
            }
            await this.bookingRepository.updatePaymentStatusAndId(savedBooking._id.toString(), `WALLET-${bookingId}`);
            // Send
            const now = new Date();
            // Send to user
            const userNotification = new notification_entity_1.Notification(null, dto.userId, 'Booking Confirmed', 'booking', `Your booking ${bookingId} has been successfully confirmed!`, savedBooking._id?.toString() || '', now, now, false, false, []);
            // Send to vendor
            const show = await this.showRepository.findById(savedBooking.showId._id.toString());
            if (!show) {
                throw new custom_error_1.CustomError('Show not found when creating vendor notification.', httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
            }
            const vendorNotification = new notification_entity_1.Notification(null, show.vendorId, 'New Booking Received', 'booking', `A new booking ${bookingId} has been made by a customer.`, null, now, now, false, false, []);
            const adminNotification = new notification_entity_1.Notification(null, null, 'New Booking Received', 'booking', `Booking ${bookingId} has been confirmed and sent to vendor.`, null, now, now, false, true, []);
            await this.notificationRepository.createNotification(userNotification);
            await this.notificationRepository.createNotification(vendorNotification);
            await this.notificationRepository.createGlobalNotification(adminNotification);
            socket_service_1.socketService.emitNotification(`vendor-${show.vendorId}`, vendorNotification);
            socket_service_1.socketService.emitNotification('admin-global', adminNotification);
            socket_service_1.socketService.emitNotification(`user-${dto.userId}`, userNotification);
            await this.userRepository.incrementLoyalityPoints(dto.userId, savedBooking.bookedSeatsId.length);
            const seatNumbers = await this.seatRepository.findSeatNumbersByIds(savedBooking.bookedSeatsId.map((seat) => seat._id));
            await this.showRepository.confirmBookedSeats(savedBooking.showId._id.toString(), seatNumbers);
            socket_service_1.socketService.emitSeatUpdate(show._id, savedBooking.bookedSeatsId.map((seat) => seat.toString()), 'booked');
            return { booking: savedBooking };
        }
        else if (dto.payment.method === 'stripe') {
            const stripeSessionUrl = await this.paymentService.createStripeSession(dto.userId, bookingId, dto.totalAmount, dto.showId, dto.bookedSeatsId);
            await this.showJobService.scheduleBookingAutoCancel(bookingId);
            return { booking: savedBooking, stripeSessionUrl };
        }
        throw new custom_error_1.CustomError(commonErrorMsg_constants_1.default.GENERAL.INVALID_PAYMENT_METHOD, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
    }
};
exports.CreateBookingUseCase = CreateBookingUseCase;
exports.CreateBookingUseCase = CreateBookingUseCase = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('BookingRepository')),
    __param(1, (0, tsyringe_1.inject)('NotificationRepository')),
    __param(2, (0, tsyringe_1.inject)('MoviePassRepository')),
    __param(3, (0, tsyringe_1.inject)('PaymentService')),
    __param(4, (0, tsyringe_1.inject)('SeatRepository')),
    __param(5, (0, tsyringe_1.inject)('ShowRepository')),
    __param(6, (0, tsyringe_1.inject)('IUserRepository')),
    __param(7, (0, tsyringe_1.inject)('ShowJobService')),
    __metadata("design:paramtypes", [Object, Object, Object, checkoutPayment_service_1.PaymentService, Object, Object, Object, showAgenda_service_1.ShowJobService])
], CreateBookingUseCase);
