import { NextFunction, Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import Stripe from 'stripe';
import { env } from '../../config/env.config';
import { sendResponse } from '../../utils/response/sendResponse.utils';
import { HttpResCode, HttpResMsg } from '../../utils/constants/httpResponseCode.utils';
import { CustomError } from '../../utils/errors/custom.error';
import { INotificationRepository } from '../../domain/interfaces/repositories/notification.repository';
import { Notification } from '../../domain/entities/notification.entity';
import BookingModel from '../../infrastructure/database/booking.model';
import { ISeatRepository } from '../../domain/interfaces/repositories/seat.repository';
import { IShowRepository } from '../../domain/interfaces/repositories/show.repository';
import { IUserRepository } from '../../domain/interfaces/repositories/user.repository';
import { socketService } from '../../infrastructure/services/socket.service';
import { SuccessMsg } from '../../utils/constants/commonSuccessMsg.constants';

/**
 * Controller for handling Stripe webhooks related to booking payments.
 */
@injectable()
export class BookingStripeWebhookController {
  private stripe: Stripe;

  /**
   * Constructs an instance of BookingStripeWebhookController.
   * @param {INotificationRepository} notificationRepository - Repository for notification data.
   * @param {ISeatRepository} seatRepository - Repository for seat data.
   * @param {IShowRepository} showRepository - Repository for show data.
   * @param {IUserRepository} userRepository - Repository for user data.
   */
  constructor(
    @inject('NotificationRepository') private notificationRepository: INotificationRepository,
    @inject('SeatRepository') private seatRepository: ISeatRepository,
    @inject('ShowRepository') private showRepository: IShowRepository,
    @inject('IUserRepository') private userRepository: IUserRepository,
  ) {
    this.stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2025-05-28.basil' });
  }

  /**
   * Handles incoming Stripe webhook events.
   * Processes 'checkout.session.completed' events to confirm bookings, update seat statuses,
   * increment loyalty points, and create/emit notifications for users, vendors, and admins.
   * @param {Request} req - The Express request object containing the Stripe event.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   * @returns {Promise<void>}
   */
  async handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    const sig = req.headers['stripe-signature'] as string;
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(req.body, sig, env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      sendResponse(res, HttpResCode.BAD_REQUEST, 'Webhook Error');
      return;
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const { userId, bookingId } = session.metadata || {};

      if (!userId || !bookingId) {
        console.error('Missing userId or bookingId in session metadata:', { userId, bookingId });
        sendResponse(res, HttpResCode.BAD_REQUEST, 'Invalid metadata');
        return;
      }

      try {
        const booking = await BookingModel.findOne({ bookingId });
        if (!booking) {
          throw new CustomError('Booking not found', HttpResCode.BAD_REQUEST);
        }

        booking.payment.status = 'completed';
        booking.payment.paymentId = session.payment_intent as string;
        await booking.save();

        const seatNumbers: string[] = await this.seatRepository.findSeatNumbersByIds(
          booking.bookedSeatsId.map((seat) => seat._id),
        );
        await this.showRepository.confirmBookedSeats(booking.showId._id.toString(), seatNumbers);
        console.log(`Emitting seatUpdate to show-${booking.showId._id}:`, {
          seatIds: booking.bookedSeatsId.map((seat) => seat.toString()),
          status: 'booked',
        });
        socketService.emitSeatUpdate(
          booking.showId._id.toString(),
          booking.bookedSeatsId.map((seat) => seat.toString()),
          'booked',
        );

        await this.userRepository.incrementLoyalityPoints(userId, booking.bookedSeatsId.length);
        const show = await this.showRepository.findById(booking.showId._id.toString());
        if (!show) {
          console.error(`Show not found for booking ${bookingId}`);
          throw new CustomError(
            'Show not found when creating vendor notification',
            HttpResCode.INTERNAL_SERVER_ERROR,
          );
        }

        const now = new Date();

        // Create notifications
        const userNotification = new Notification(
          null as any,
          userId,
          'Booking Confirmed',
          'booking',
          `Your booking ${bookingId} has been successfully confirmed!`,
          booking._id?.toString() || '',
          now,
          now,
          false,
          false,
          [],
        );

        const vendorNotification = new Notification(
          null as any,
          show.vendorId.toString(),
          'New Booking Received',
          'booking',
          `A new booking ${bookingId} has been made by a customer.`,
          null,
          now,
          now,
          false,
          false,
          [],
        );

        const adminNotification = new Notification(
          null as any,
          null,
          'New Booking Received',
          'booking',
          `Booking ${bookingId} has been confirmed and sent to vendor.`,
          null,
          now,
          now,
          false,
          true,
          [],
        );

        // Save notifications to database
        const savedUserNotification =
          await this.notificationRepository.createNotification(userNotification);
        const savedVendorNotification =
          await this.notificationRepository.createNotification(vendorNotification);
        const savedAdminNotification =
          await this.notificationRepository.createGlobalNotification(adminNotification);

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
          readedUsers: savedUserNotification.readedUsers,
        };
        console.log(`Emitting user notification to user-${userId}:`, userNotificationPayload);
        socketService.emitNotification(`user-${userId}`, userNotificationPayload);

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
          readedUsers: savedUserNotification.readedUsers,
        };
        console.log(
          `Emitting vendor notification to vendor-${show.vendorId}:`,
          vendorNotificationPayload,
        );
        socketService.emitNotification(`vendor-${show.vendorId}`, vendorNotificationPayload);

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
          readedUsers: savedUserNotification.readedUsers,
        };
        console.log(`Emitting admin notification to admin-global:`, adminNotificationPayload);
        socketService.emitNotification('admin-global', adminNotificationPayload);

        console.log(`✅ Booking ${bookingId} confirmed for user ${userId}`);
      } catch (error) {
        console.error(`❌ Failed to confirm booking ${bookingId}:`, error);
        sendResponse(res, HttpResCode.INTERNAL_SERVER_ERROR, 'Failed to process booking');
        return;
      }
    }

    sendResponse(res, HttpResCode.OK, SuccessMsg.WEBHOOK_RECIEVED);
  }
}
