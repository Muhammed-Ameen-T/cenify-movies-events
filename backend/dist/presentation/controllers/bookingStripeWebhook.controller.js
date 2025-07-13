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
exports.BookingStripeWebhookController = void 0;
const tsyringe_1 = require("tsyringe");
const stripe_1 = __importDefault(require("stripe"));
const env_config_1 = require("../../config/env.config");
const sendResponse_utils_1 = require("../../utils/response/sendResponse.utils");
const httpResponseCode_utils_1 = require("../../utils/constants/httpResponseCode.utils");
const custom_error_1 = require("../../utils/errors/custom.error");
const notification_entity_1 = require("../../domain/entities/notification.entity");
const booking_model_1 = __importDefault(require("../../infrastructure/database/booking.model"));
const socket_service_1 = require("../../infrastructure/services/socket.service");
const commonSuccessMsg_constants_1 = require("../../utils/constants/commonSuccessMsg.constants");
let BookingStripeWebhookController = class BookingStripeWebhookController {
    constructor(notificationRepository, seatRepository, showRepository, userRepository) {
        this.notificationRepository = notificationRepository;
        this.seatRepository = seatRepository;
        this.showRepository = showRepository;
        this.userRepository = userRepository;
        this.stripe = new stripe_1.default(env_config_1.env.STRIPE_SECRET_KEY, { apiVersion: '2025-05-28.basil' });
    }
    async handleWebhook(req, res, next) {
        const sig = req.headers['stripe-signature'];
        let event;
        try {
            event = this.stripe.webhooks.constructEvent(req.body, sig, env_config_1.env.STRIPE_WEBHOOK_SECRET);
        }
        catch (err) {
            (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST, 'Webhook Error');
            return;
        }
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const { userId, bookingId } = session.metadata || {};
            if (!userId || !bookingId) {
                console.error('Missing userId or bookingId in session metadata:', { userId, bookingId });
                (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.BAD_REQUEST, 'Invalid metadata');
                return;
            }
            try {
                const booking = await booking_model_1.default.findOne({ bookingId });
                if (!booking) {
                    throw new custom_error_1.CustomError('Booking not found', httpResponseCode_utils_1.HttpResCode.BAD_REQUEST);
                }
                booking.payment.status = 'completed';
                booking.payment.paymentId = session.payment_intent;
                await booking.save();
                const seatNumbers = await this.seatRepository.findSeatNumbersByIds(booking.bookedSeatsId.map((seat) => seat._id));
                await this.showRepository.confirmBookedSeats(booking.showId._id.toString(), seatNumbers);
                console.log(`Emitting seatUpdate to show-${booking.showId._id}:`, {
                    seatIds: booking.bookedSeatsId.map((seat) => seat.toString()),
                    status: 'booked',
                });
                socket_service_1.socketService.emitSeatUpdate(booking.showId._id.toString(), booking.bookedSeatsId.map((seat) => seat.toString()), 'booked');
                await this.userRepository.incrementLoyalityPoints(userId, booking.bookedSeatsId.length);
                const show = await this.showRepository.findById(booking.showId._id.toString());
                if (!show) {
                    console.error(`Show not found for booking ${bookingId}`);
                    throw new custom_error_1.CustomError('Show not found when creating vendor notification', httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR);
                }
                const now = new Date();
                // Create notifications
                const userNotification = new notification_entity_1.Notification(null, userId, 'Booking Confirmed', 'booking', `Your booking ${bookingId} has been successfully confirmed!`, booking._id?.toString() || '', now, now, false, false, []);
                const vendorNotification = new notification_entity_1.Notification(null, show.vendorId.toString(), 'New Booking Received', 'booking', `A new booking ${bookingId} has been made by a customer.`, null, now, now, false, false, []);
                const adminNotification = new notification_entity_1.Notification(null, null, 'New Booking Received', 'booking', `Booking ${bookingId} has been confirmed and sent to vendor.`, null, now, now, false, true, []);
                // Save notifications to database
                const savedUserNotification = await this.notificationRepository.createNotification(userNotification);
                const savedVendorNotification = await this.notificationRepository.createNotification(vendorNotification);
                const savedAdminNotification = await this.notificationRepository.createGlobalNotification(adminNotification);
                // Emit notifications with consistent structure
                const userNotificationPayload = {
                    _id: savedUserNotification._id?.toString() || '',
                    userId: userId,
                    title: savedUserNotification.title,
                    type: savedUserNotification.type,
                    description: savedUserNotification.description,
                    bookingId: savedUserNotification.bookingId,
                    createdAt: savedUserNotification.createdAt,
                    updatedAt: savedUserNotification.updatedAt,
                    isRead: savedUserNotification.isRead,
                    isGlobal: savedUserNotification.isGlobal,
                    readedUsers: savedUserNotification.readedUsers
                };
                console.log(`Emitting user notification to user-${userId}:`, userNotificationPayload);
                socket_service_1.socketService.emitNotification(`user-${userId}`, userNotificationPayload);
                const vendorNotificationPayload = {
                    _id: savedVendorNotification._id?.toString() || '',
                    userId: savedVendorNotification.userId,
                    title: savedVendorNotification.title,
                    type: savedVendorNotification.type,
                    description: savedVendorNotification.description,
                    bookingId: savedVendorNotification.bookingId,
                    createdAt: savedVendorNotification.createdAt,
                    updatedAt: savedVendorNotification.updatedAt,
                    isRead: savedVendorNotification.isRead,
                    isGlobal: savedVendorNotification.isGlobal,
                    readedUsers: savedUserNotification.readedUsers
                };
                console.log(`Emitting vendor notification to vendor-${show.vendorId}:`, vendorNotificationPayload);
                socket_service_1.socketService.emitNotification(`vendor-${show.vendorId}`, vendorNotificationPayload);
                const adminNotificationPayload = {
                    _id: savedAdminNotification._id?.toString() || '',
                    userId: savedAdminNotification.userId,
                    title: savedAdminNotification.title,
                    type: savedAdminNotification.type,
                    description: savedAdminNotification.description,
                    bookingId: savedAdminNotification.bookingId,
                    createdAt: savedAdminNotification.createdAt,
                    updatedAt: savedAdminNotification.updatedAt,
                    isRead: savedAdminNotification.isRead,
                    isGlobal: savedAdminNotification.isGlobal,
                    readedUsers: savedUserNotification.readedUsers
                };
                console.log(`Emitting admin notification to admin-global:`, adminNotificationPayload);
                socket_service_1.socketService.emitNotification('admin-global', adminNotificationPayload);
                console.log(`✅ Booking ${bookingId} confirmed for user ${userId}`);
            }
            catch (error) {
                console.error(`❌ Failed to confirm booking ${bookingId}:`, error);
                (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR, 'Failed to process booking');
                return;
            }
        }
        (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.OK, commonSuccessMsg_constants_1.SuccessMsg.WEBHOOK_RECIEVED);
    }
};
exports.BookingStripeWebhookController = BookingStripeWebhookController;
exports.BookingStripeWebhookController = BookingStripeWebhookController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('NotificationRepository')),
    __param(1, (0, tsyringe_1.inject)('SeatRepository')),
    __param(2, (0, tsyringe_1.inject)('ShowRepository')),
    __param(3, (0, tsyringe_1.inject)('IUserRepository')),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], BookingStripeWebhookController);
