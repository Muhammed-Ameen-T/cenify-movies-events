import { inject, injectable } from 'tsyringe';
import { IBookingRepository } from '../../../domain/interfaces/repositories/booking.repository';
import { INotificationRepository } from '../../../domain/interfaces/repositories/notification.repository';
import { CustomError } from '../../../utils/errors/custom.error';
import { HttpResCode } from '../../../utils/constants/httpResponseCode.utils';
import { Booking } from '../../../domain/entities/booking.entity';
import ERROR_MESSAGES from '../../../utils/constants/commonErrorMsg.constants';
import { Notification } from '../../../domain/entities/notification.entity';
import { ICancelBookingUseCase } from '../../../domain/interfaces/useCases/User/cancelBooking.interface';
import { IWalletRepository } from '../../../domain/interfaces/repositories/wallet.repository';
import { socketService } from '../../../infrastructure/services/socket.service';

@injectable()
export class CancelBookingUseCase implements ICancelBookingUseCase {
  constructor(
    @inject('BookingRepository') private bookingRepository: IBookingRepository,
    @inject('NotificationRepository') private notificationRepository: INotificationRepository,
    @inject('WalletRepository') private walletRepository: IWalletRepository,
  ) {}

  async execute(bookingId: string, reason: string): Promise<Booking> {
    const existingBooking = await this.bookingRepository.findByBookingId(bookingId);

    if (!existingBooking) {
      throw new CustomError(ERROR_MESSAGES.DATABASE.RECORD_NOT_FOUND, HttpResCode.NOT_FOUND);
    }

    const show = existingBooking.showId as any;
    const theater = show.theaterId as any;

    if (!theater.facilities?.freeCancellation) {
      throw new CustomError(
        ERROR_MESSAGES.VALIDATION.THEATER_NOT_PROVIDE_CANCELLATION,
        HttpResCode.BAD_REQUEST,
      );
    }

    if (existingBooking.status === 'cancelled') {
      return existingBooking;
    }

    if (!existingBooking._id) {
      throw new CustomError(ERROR_MESSAGES.DATABASE.RECORD_NOT_FOUND, HttpResCode.NOT_FOUND);
    }
    const updatedBooking = await this.bookingRepository.cancelBooking(
      existingBooking._id.toString(),
      reason,
    );
    if (!updatedBooking) {
      throw new CustomError(
        ERROR_MESSAGES.GENERAL.FAILED_CANCELLING_BOOKING,
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }

    const notification = new Notification(
      null as any,
      existingBooking.userId._id.toString(),
      'Booking Cancelled',
      'booking',
      `Your booking ${bookingId} has been cancelled. If payment was completed, the amount has been refunded to your wallet`,
      null,
      new Date(),
      new Date(),
      false,
      false,
      [],
    );
    await this.notificationRepository.createNotification(notification);
    socketService.emitNotification(`user-${existingBooking.userId._id.toString()}`, notification);

    if (updatedBooking.payment.status === 'completed') {
      const cancellationFeePercentage = 15;
      const cancellationFee = (existingBooking.totalAmount * cancellationFeePercentage) / 100;
      const refundableAmount = existingBooking.totalAmount - cancellationFee;
      await this.walletRepository.pushTransactionAndUpdateBalance(
        existingBooking.userId._id.toString(),
        {
          amount: refundableAmount,
          remark: 'Booking Refund amount Credited to Wallet after charges.',
          type: 'credit',
          source: 'booking',
          createdAt: new Date(),
        },
      );
    }

    return updatedBooking;
  }
}
