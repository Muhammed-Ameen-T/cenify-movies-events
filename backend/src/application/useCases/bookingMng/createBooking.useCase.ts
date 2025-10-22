import { inject, injectable } from 'tsyringe';
import { IBookingRepository } from '../../../domain/interfaces/repositories/booking.repository';
import { ICreateBookingUseCase } from '../../../domain/interfaces/useCases/User/createBooking.interface';
import { CreateBookingDTO } from '../../dtos/booking.dto';
import { Booking } from '../../../domain/entities/booking.entity';
import { INotificationRepository } from '../../../domain/interfaces/repositories/notification.repository';
import { Notification } from '../../../domain/entities/notification.entity';
import { CustomError } from '../../../utils/errors/custom.error';
import { HttpResCode } from '../../../utils/constants/httpResponseCode.utils';
import { BookingGenerateService } from '../../../infrastructure/services/bookingIdGenerate.service';
import mongoose from 'mongoose';
import { PaymentService } from '../../../infrastructure/services/checkoutPayment.service';
import { IMoviePassRepository } from '../../../domain/interfaces/repositories/moviePass.repository';
import ERROR_MESSAGES from '../../../utils/constants/commonErrorMsg.constants';
import { ISeatRepository } from '../../../domain/interfaces/repositories/seat.repository';
import { IShowRepository } from '../../../domain/interfaces/repositories/show.repository';
import { IUserRepository } from '../../../domain/interfaces/repositories/user.repository';
import { socketService } from '../../../infrastructure/services/socket.service';
import { ShowJobService } from '../../../infrastructure/services/showAgenda.service';

@injectable()
export class CreateBookingUseCase implements ICreateBookingUseCase {
  constructor(
    @inject('BookingRepository') private _bookingRepository: IBookingRepository,
    @inject('NotificationRepository') private _notificationRepository: INotificationRepository,
    @inject('MoviePassRepository') private _moviePassRepository: IMoviePassRepository,
    @inject('PaymentService') private _paymentService: PaymentService,
    @inject('SeatRepository') private _seatRepository: ISeatRepository,
    @inject('ShowRepository') private _showRepository: IShowRepository,
    @inject('IUserRepository') private _userRepository: IUserRepository,
    @inject('ShowJobService') private _showJobService: ShowJobService,
  ) {}

  async execute(dto: CreateBookingDTO): Promise<{ booking: Booking; stripeSessionUrl?: string }> {
    // Validate session timeout
    if (dto.expiresAt && new Date(dto.expiresAt) < new Date()) {
      throw new CustomError(ERROR_MESSAGES.GENERAL.SESSION_EXPIRED, HttpResCode.BAD_REQUEST);
    }

    // Calculate movie pass discount
    let moviePassDiscount = 0;
    const hasMoviePass = await this._moviePassRepository.findByUserId(dto.userId);
    if (hasMoviePass && dto.moviePassApplied && hasMoviePass.status === 'Active') {
      moviePassDiscount = Math.round(dto.subTotal * 0.08); // 8% discount
      dto.moviePassApplied = true;
    }

    // Validate total amount
    const expectedTotal =
      dto.subTotal +
      dto.convenienceFee -
      moviePassDiscount -
      (dto.couponDiscount ? dto.couponDiscount : 0) +
      dto.donation;
    if (Math.abs(dto.totalAmount - expectedTotal) > 1) {
      throw new CustomError(ERROR_MESSAGES.GENERAL.INVALID_TOTAL_AMOUNT, HttpResCode.BAD_REQUEST);
    }
    const totalDiscount = Math.round(
      moviePassDiscount + (dto.couponDiscount ? dto.couponDiscount : 0),
    );
    const bookingId = BookingGenerateService.generateBookingId();
    const newQrCode = await BookingGenerateService.generateQrCode(bookingId);

    const newBooking = new Booking(
      null,
      new mongoose.Types.ObjectId(dto.showId),
      new mongoose.Types.ObjectId(dto.userId),
      dto.bookedSeatsId.map((seatId) => new mongoose.Types.ObjectId(seatId)),
      bookingId,
      'confirmed',
      {
        ...dto.payment,
        status: 'pending',
      },
      newQrCode,
      dto.subTotal,
      dto.couponDiscount || 0,
      dto.couponApplied || false,
      dto.convenienceFee,
      dto.donation,
      dto.moviePassApplied || false,
      moviePassDiscount,
      totalDiscount,
      dto.totalAmount,
      0,
      dto.expiresAt,
      null,
      new Date(),
      new Date(),
    );

    await this._bookingRepository.create(newBooking);
    const savedBooking = await this._bookingRepository.findByBookingId(bookingId);
    if (!savedBooking) {
      throw new CustomError(
        ERROR_MESSAGES.GENERAL.FAILED_CREATING_BOOKING,
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }

    await this._moviePassRepository.incrementMovieStats(dto.userId, moviePassDiscount);
    // Process payment
    if (dto.payment.method === 'wallet') {
      await this._paymentService.deductWalletBalance(dto.userId, dto.totalAmount);

      if (!savedBooking._id) {
        throw new CustomError(
          'Booking ID is missing after creation.',
          HttpResCode.INTERNAL_SERVER_ERROR,
        );
      }
      await this._bookingRepository.updatePaymentStatusAndId(
        savedBooking._id.toString(),
        `WALLET-${bookingId}`,
      );

      // Send
      const now = new Date();

      // Send to user
      const userNotification = new Notification(
        null,
        dto.userId,
        'Booking Confirmed',
        'booking',
        `Your booking ${bookingId} has been successfully confirmed!`,
        savedBooking._id?.toString() || '',
        now,
        now,
        false,
        false,
        [],
      );

      // Send to vendor
      const show = await this._showRepository.findById(savedBooking.showId._id.toString());
      if (!show) {
        throw new CustomError(
          'Show not found when creating vendor notification.',
          HttpResCode.INTERNAL_SERVER_ERROR,
        );
      }
      const vendorNotification = new Notification(
        null,
        show.vendorId,
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
        null,
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

      await this._notificationRepository.createNotification(userNotification);
      await this._notificationRepository.createNotification(vendorNotification);
      await this._notificationRepository.createGlobalNotification(adminNotification);
      socketService.emitNotification(`vendor-${show.vendorId}`, vendorNotification);
      socketService.emitNotification('admin-global', adminNotification);
      socketService.emitNotification(`user-${dto.userId}`, userNotification);

      await this._userRepository.incrementLoyalityPoints(
        dto.userId,
        savedBooking.bookedSeatsId.length,
      );
      const seatNumbers: string[] = await this._seatRepository.findSeatNumbersByIds(
        savedBooking.bookedSeatsId.map((seat) => seat._id),
      );

      await this._showRepository.confirmBookedSeats(savedBooking.showId._id.toString(), seatNumbers);

      socketService.emitSeatUpdate(
        show._id ? show._id : '',
        savedBooking.bookedSeatsId.map((seat) => seat.toString()),
        'booked',
      );

      return { booking: savedBooking };
    } else if (dto.payment.method === 'stripe') {
      const stripeSessionUrl = await this._paymentService.createStripeSession(
        dto.userId,
        bookingId,
        dto.totalAmount,
        dto.showId,
        dto.bookedSeatsId,
      );
      await this._showJobService.scheduleBookingAutoCancel(bookingId);

      return { booking: savedBooking, stripeSessionUrl };
    }

    throw new CustomError(ERROR_MESSAGES.GENERAL.INVALID_PAYMENT_METHOD, HttpResCode.BAD_REQUEST);
  }
}
