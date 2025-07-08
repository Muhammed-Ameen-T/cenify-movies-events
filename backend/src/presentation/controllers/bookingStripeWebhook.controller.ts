import { Request, Response } from 'express';
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
import { IBookingRepository } from '../../domain/interfaces/repositories/booking.repository';
import { IShowRepository } from '../../domain/interfaces/repositories/show.repository';
import { IUserRepository } from '../../domain/interfaces/repositories/user.repository';
import { socketService } from '../../infrastructure/services/socket.service';

@injectable()
export class BookingStripeWebhookController {
  private stripe: Stripe;

  constructor(
    @inject('NotificationRepository') private notificationRepository: INotificationRepository,
    @inject('SeatRepository') private seatRepository: ISeatRepository,
    @inject('ShowRepository') private showRepository: IShowRepository,
    @inject('IUserRepository') private userRepository: IUserRepository,
  ) {
    this.stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2025-05-28.basil' });
  }

  async handleWebhook(req: Request, res: Response): Promise<void> {
    const sig = req.headers['stripe-signature'] as string;
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(req.body, sig, env.STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      sendResponse(res, HttpResCode.BAD_REQUEST, 'Webhook Error');
      return;
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const { userId, bookingId } = session.metadata || {};

      if (userId && bookingId) {
        try {
          const booking = await BookingModel.findOne({ bookingId });
          if (!booking) {
            throw new CustomError('Booking not found', HttpResCode.BAD_REQUEST);
          }

          booking.payment.status = 'completed';
          booking.payment.paymentId = session.payment_intent as string;
          await booking.save();

          // const seatNumbers:string[] = await this.seatRepository.findSeatNumbersByIds(booking.bookedSeatsId)
          // await this.showRepository.confirmBookedSeats(booking.showId.toString(),seatNumbers)
          const seatNumbers: string[] = await this.seatRepository.findSeatNumbersByIds(
            booking.bookedSeatsId.map((seat) => seat._id),
          );
          await this.showRepository.confirmBookedSeats(booking.showId._id.toString(), seatNumbers);
          socketService.emitSeatUpdate(
            booking.showId._id.toString(),
            booking.bookedSeatsId.map((seat) => seat.toString()),
            'booked',
          );

          await this.userRepository.incrementLoyalityPoints(userId, booking.bookedSeatsId.length);
          const show = await this.showRepository.findById(booking.showId._id.toString());

          const now = new Date();
          const notification = new Notification(
            null as any,
            userId,
            'Booking Confirmed',
            'Booking',
            `Your booking ${bookingId} has been successfully confirmed!`,
            null,
            now,
            now,
            false,
            false,
            [],
          );
          const vendorNotification = new Notification(
            null as any,
            show?.vendorId,
            'New Booking Received',
            'Booking',
            `A new booking ${bookingId} has been made by a customer.`,
            booking._id?.toString() || '',
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
            'Booking',
            `Booking ${bookingId} has been confirmed and sent to vendor.`,
            booking._id?.toString() || '',
            now,
            now,
            false,
            true,
            [],
          );
          await this.notificationRepository.createNotification(notification);
          await this.notificationRepository.createGlobalNotification(adminNotification);
          await this.notificationRepository.createNotification(vendorNotification);

          console.log(`✅ Booking ${bookingId} confirmed for user ${userId}`);
        } catch (error: any) {
          console.error(`❌ Failed to confirm booking ${bookingId}:`, error.message);
        }
      }
    }

    sendResponse(res, HttpResCode.OK, 'Webhook received');
  }
}
