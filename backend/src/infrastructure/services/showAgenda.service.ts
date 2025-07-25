import { inject, injectable } from 'tsyringe';
import Agenda, { Job } from 'agenda';
import { IShowRepository } from '../../domain/interfaces/repositories/show.repository';
import { CustomError } from '../../utils/errors/custom.error';
import { HttpResCode } from '../../utils/constants/httpResponseCode.utils';
import ERROR_MESSAGES from '../../utils/constants/commonErrorMsg.constants';
import { env } from '../../config/env.config';
import { SuccessMsg } from '../../utils/constants/commonSuccessMsg.constants';
import { ICancelBookingUseCase } from '../../domain/interfaces/useCases/User/cancelBooking.interface';
import { IBookingRepository } from '../../domain/interfaces/repositories/booking.repository';

@injectable()
export class ShowJobService {
  private agenda: Agenda;

  constructor(
    @inject('ShowRepository') private showRepository: IShowRepository,
    @inject('CancelBookingUseCase') private cancelBooking: ICancelBookingUseCase,
    @inject('BookingRepository') private bookingRepository: IBookingRepository,
  ) {
    // Initialize Agenda with MongoDB connection
    this.agenda = new Agenda({
      db: {
        address: env.MONGO_URI,
        collection: 'agendaJobs',
      },
      processEvery: '1 minute',
      maxConcurrency: 10,
    });

    // Define jobs
    this.defineJobs();
  }

  private defineJobs() {
    // Job to set show status to Running
    this.agenda.define('startShow', async (job: Job) => {
      const { showId } = job.attrs.data;
      try {
        const show = await this.showRepository.findById(showId);
        if (!show) {
          throw new CustomError(ERROR_MESSAGES.VALIDATION.SHOW_NOT_FOUND, HttpResCode.BAD_REQUEST);
        }
        if (show.status === 'Scheduled') {
          await this.showRepository.updateStatus(showId, 'Running');
          console.log(`✅ Show ${showId} status updated to Running`);
        }
      } catch (error) {
        console.error(`❌ Error starting show ${showId}:`, error);
        throw error;
      }
    });

    // Job to set show status to Completed
    this.agenda.define('completeShow', async (job: Job) => {
      const { showId } = job.attrs.data;
      try {
        const show = await this.showRepository.findById(showId);
        if (!show) {
          throw new CustomError(ERROR_MESSAGES.VALIDATION.SHOW_NOT_FOUND, HttpResCode.BAD_REQUEST);
        }
        if (show.status === 'Running') {
          await this.showRepository.updateStatus(showId, 'Completed');
          await this.showRepository.creditRevenueToWallet(showId);
          console.log(`✅ Show ${showId} status updated to Completed`);
        }
      } catch (error) {
        console.error(`❌ Error completing show ${showId}:`, error);
        throw error;
      }
    });

    // Job to release expired pending seats
    this.agenda.define('releaseExpiredSeats', async (job: Job) => {
      const { showId } = job.attrs.data;

      try {
        await this.showRepository.pullExpiredSeats(showId);

        console.log(`✅ Expired pending seats removed for showId: ${showId}`);
      } catch (error) {
        console.error(`❌ Error releasing expired pending seats for showId: ${showId}`, error);
        throw error;
      }
    });

    this.agenda.define('cancelPendingBooking', async (job: Job) => {
      const { bookingId } = job.attrs.data;
      try {
        console.log(`🔍 Validating booking ${bookingId} for cancellation`);

        const booking = await this.bookingRepository.findByBookingId(bookingId);
        if (!booking) {
          throw new CustomError(ERROR_MESSAGES.DATABASE.RECORD_NOT_FOUND, HttpResCode.NOT_FOUND);
        }

        if (booking.payment.status === 'pending' && booking.status !== 'cancelled') {
          await this.cancelBooking.execute(bookingId, 'Payment not completed within time period');
          console.log(`🚫 Booking ${bookingId} auto-cancelled due to pending payment`);
        } else {
          console.log(
            `✅ Booking ${bookingId} payment status: ${booking.payment.status}, skipping cancellation.`,
          );
        }
      } catch (error) {
        console.error(`❌ Error cancelling booking ${bookingId}:`, error);
      }
    });
  }

  async scheduleShowJobs(
    showId: string,
    startTime: Date,
    endTime: Date | undefined,
  ): Promise<void> {
    try {
      await this.cancelShowJobs(showId);

      await this.agenda.schedule(startTime, 'startShow', { showId });
      console.log(`✅ Scheduled startShow job for showId: ${showId} at ${startTime}`);

      if (endTime) {
        await this.agenda.schedule(endTime, 'completeShow', { showId });
        console.log(`✅ Scheduled completeShow job for showId: ${showId} at ${endTime}`);
      }
    } catch (error) {
      console.error(`❌ Error scheduling show jobs for showId: ${showId}`, error);
      throw new CustomError('Failed to schedule show jobs', HttpResCode.INTERNAL_SERVER_ERROR);
    }
  }

  async scheduleSeatExpiration(showId: string): Promise<void> {
    try {
      await this.agenda.schedule(new Date(Date.now() + 5 * 60 * 1000), 'releaseExpiredSeats', {
        showId,
      });
      console.log(`✅ Scheduled releaseExpiredSeats job for showId: ${showId} to run in 5 minutes`);
    } catch (error) {
      console.error(`❌ Error scheduling seat expiration job for showId: ${showId}`, error);
      throw new CustomError(
        'Failed to schedule seat expiration job',
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async cancelShowJobs(showId: string): Promise<void> {
    try {
      await this.agenda.cancel({ 'data.showId': showId });
      console.log(`✅ Cancelled existing jobs for showId: ${showId}`);
    } catch (error) {
      console.error(`❌ Error cancelling jobs for showId: ${showId}`, error);
      throw new CustomError('Failed to cancel show jobs', HttpResCode.INTERNAL_SERVER_ERROR);
    }
  }

  async scheduleBookingAutoCancel(bookingId: string): Promise<void> {
    try {
      await this.agenda.schedule(new Date(Date.now() + 10 * 60 * 1000), 'cancelPendingBooking', {
        bookingId,
      });
      console.log(
        `✅ Scheduled cancelPendingBooking job for bookingId: ${bookingId} to run in 10 minutes`,
      );
    } catch (error) {
      console.error(
        `❌ Error scheduling cancelPendingBooking job for bookingId: ${bookingId}`,
        error,
      );
      throw new CustomError(
        'Failed to schedule booking auto-cancel job',
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async startAgenda(): Promise<void> {
    try {
      await this.agenda.start();
      console.log(SuccessMsg.AGENDA_STARTED);
    } catch (error) {
      console.error(ERROR_MESSAGES.GENERAL.FAILED_START_AGENDA, error);
      throw new CustomError('Failed to start Agenda scheduler', HttpResCode.INTERNAL_SERVER_ERROR);
    }
  }
}
