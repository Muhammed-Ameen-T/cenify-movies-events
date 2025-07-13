import { inject, injectable } from 'tsyringe';
import Agenda, { Job } from 'agenda';
import { IMoviePassRepository } from '../../domain/interfaces/repositories/moviePass.repository';
import { IUserRepository } from '../../domain/interfaces/repositories/user.repository';
import { CustomError } from '../../utils/errors/custom.error';
import { HttpResCode } from '../../utils/constants/httpResponseCode.utils';
import { env } from '../../config/env.config';
import { SuccessMsg } from '../../utils/constants/commonSuccessMsg.constants';

@injectable()
export class MoviePassJobService {
  private agenda: Agenda;

  constructor(
    @inject('MoviePassRepository') private moviePassRepository: IMoviePassRepository,
    @inject('IUserRepository') private userRepository: IUserRepository,
  ) {
    this.agenda = new Agenda({
      db: {
        address: env.MONGO_URI,
        collection: 'agendaJobs',
      },
      processEvery: '1 minute',
      maxConcurrency: 10,
    });

    this.defineJobs();
  }

  private defineJobs() {
    this.agenda.define('expireMoviePass', async (job: Job) => {
      const { userId } = job.attrs.data;
      try {
        const moviePass = await this.moviePassRepository.findByUserId(userId);
        if (!moviePass) {
          throw new CustomError('Movie Pass not found', HttpResCode.BAD_REQUEST);
        }
        if (moviePass.status === 'Active') {
          await this.moviePassRepository.updateStatus(userId, 'Inactive');
          await this.userRepository.updateMoviePass(userId, {
            moviePass: {
              buyDate: null,
              expiryDate: null,
              isPass: false,
            },
          });
          console.log(
            `✅ MoviePassJobService ~ expireMoviePass ~ Movie Pass for user ${userId} set to Inactive`,
          );
        } else {
          console.log(
            `⚠️ MoviePassJobService ~ expireMoviePass ~ Movie Pass for user ${userId} is already ${moviePass.status}`,
          );
        }
      } catch (error) {
        console.error(
          `❌ MoviePassJobService ~ expireMoviePass ~ Error for userId: ${userId}`,
          error,
        );
        throw error;
      }
    });
  }

  async scheduleMoviePassExpiration(userId: string, expireDate: Date): Promise<void> {
    try {
      await this.cancelMoviePassJobs(userId);
      await this.agenda.schedule(expireDate, 'expireMoviePass', { userId });
      console.log(
        `✅ MoviePassJobService ~ scheduleMoviePassExpiration ~ Scheduled expiration for userId: ${userId} at ${expireDate}`,
      );
    } catch (error) {
      console.error(
        `❌ MoviePassJobService ~ scheduleMoviePassExpiration ~ Error scheduling job for userId: ${userId}`,
        error,
      );
      throw new CustomError(
        'Failed to schedule Movie Pass expiration',
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async cancelMoviePassJobs(userId: string): Promise<void> {
    try {
      await this.agenda.cancel({ 'data.userId': userId });
      console.log(
        `✅ MoviePassJobService ~ cancelMoviePassJobs ~ Cancelled existing jobs for userId: ${userId}`,
      );
    } catch (error) {
      console.error(
        `❌ MoviePassJobService ~ cancelMoviePassJobs ~ Error cancelling jobs for userId: ${userId}`,
        error,
      );
      throw new CustomError('Failed to cancel Movie Pass jobs', HttpResCode.INTERNAL_SERVER_ERROR);
    }
  }

  async startAgenda(): Promise<void> {
    try {
      await this.agenda.start();
      console.log(SuccessMsg.AGENDA_STARTED);
    } catch (error) {
      console.error('Failed to start Agenda scheduler', error);
      throw new CustomError('Failed to start Agenda scheduler', HttpResCode.INTERNAL_SERVER_ERROR);
    }
  }
}
