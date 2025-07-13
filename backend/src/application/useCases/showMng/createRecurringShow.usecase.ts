import { inject, injectable } from 'tsyringe';
import { Show } from '../../../domain/entities/show.entity';
import { IShowRepository } from '../../../domain/interfaces/repositories/show.repository';
import { IScreenRepository } from '../../../domain/interfaces/repositories/screen.repository';
import { IMovieRepository } from '../../../domain/interfaces/repositories/movie.repository';
import { ITheaterRepository } from '../../../domain/interfaces/repositories/theater.repository';
import { ICreateRecurringShowUseCase } from '../../../domain/interfaces/useCases/Vendor/createRecurringShow.interface';
import { CustomError } from '../../../utils/errors/custom.error';
import { HttpResCode } from '../../../utils/constants/httpResponseCode.utils';
import ERROR_MESSAGES from '../../../utils/constants/commonErrorMsg.constants';
import mongoose from 'mongoose';

@injectable()
export class CreateRecurringShowUseCase implements ICreateRecurringShowUseCase {
  constructor(
    @inject('ShowRepository') private showRepository: IShowRepository,
    @inject('ScreenRepository') private screenRepository: IScreenRepository,
    @inject('MovieRepository') private movieRepository: IMovieRepository,
    @inject('TheaterRepository') private theaterRepository: ITheaterRepository,
  ) {}

  async execute(
    showId: string,
    startDate: string,
    endDate: string,
    vendorId: string,
  ): Promise<Show[]> {
    try {
      // Validate showId
      if (!mongoose.Types.ObjectId.isValid(showId)) {
        throw new CustomError('Invalid show ID', HttpResCode.BAD_REQUEST);
      }

      // Fetch the original show
      const originalShow = await this.showRepository.findById(showId);
      if (!originalShow) {
        throw new CustomError(ERROR_MESSAGES.VALIDATION.SHOW_NOT_FOUND, HttpResCode.BAD_REQUEST);
      }

      // Validate vendor ownership
      if (originalShow.vendorId != vendorId) {
        throw new CustomError(
          'Unauthorized: Vendor does not own this show',
          HttpResCode.UNAUTHORIZED,
        );
      }

      // Validate IDs in originalShow
      const idsToValidate = {
        movieId: originalShow.movieId?._id?.toString(),
        theaterId: originalShow.theaterId?._id?.toString(),
        screenId: originalShow.screenId?._id?.toString(),
        vendorId: originalShow.vendorId?.toString(),
      };

      for (const [key, id] of Object.entries(idsToValidate)) {
        if (!id || typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
          throw new CustomError(`Invalid ${key} in original show data`, HttpResCode.BAD_REQUEST);
        }
      }

      // Validate dates
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new CustomError(ERROR_MESSAGES.VALIDATION.INVALID_DATE, HttpResCode.BAD_REQUEST);
      }
      if (start > end) {
        throw new CustomError('Start date cannot be after end date', HttpResCode.BAD_REQUEST);
      }

      // Fetch movie duration
      const movie = await this.movieRepository.findById(idsToValidate.movieId);
      if (!movie || !movie.duration) {
        throw new CustomError(ERROR_MESSAGES.VALIDATION.MOVIE_NOT_FOUND, HttpResCode.BAD_REQUEST);
      }
      const { hours, minutes, seconds } = movie.duration;
      const movieDurationMs = (hours * 3600 + minutes * 60 + seconds) * 1000;

      // Fetch theater interval gap
      const theater = await this.theaterRepository.findById(idsToValidate.theaterId);
      if (!theater || typeof theater.intervalTime !== 'number') {
        throw new CustomError(ERROR_MESSAGES.VALIDATION.THEATER_NOT_FOUND, HttpResCode.BAD_REQUEST);
      }
      const intervalGapMs = theater.intervalTime * 60 * 1000;

      // Generate list of dates
      const dates: Date[] = [];
      let currentDate = new Date(start);
      while (currentDate <= end) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }

      const createdShows: Show[] = [];
      for (const showDate of dates) {
        // Calculate start and end times for the new show on this date
        const startTime = new Date(showDate);
        startTime.setHours(
          originalShow.startTime.getHours(),
          originalShow.startTime.getMinutes(),
          originalShow.startTime.getSeconds(),
          originalShow.startTime.getMilliseconds(),
        );
        const endTime = new Date(startTime.getTime() + movieDurationMs + intervalGapMs);

        // Check for time slot availability
        const isSlotAvailable = await this.screenRepository.checkSlot(
          idsToValidate.screenId,
          startTime,
          endTime,
        );
        if (!isSlotAvailable) {
          throw new CustomError(
            `Time slot conflict detected for show on ${showDate.toISOString().split('T')[0]}`,
            HttpResCode.BAD_REQUEST,
          );
        }

        // Create new show
        const newShow = new Show(
          null as any,
          startTime,
          idsToValidate.movieId, // Use string ID
          idsToValidate.theaterId,
          idsToValidate.screenId,
          idsToValidate.vendorId,
          'Scheduled',
          [],
          endTime,
          showDate,
        );

        const savedShow = await this.showRepository.create(newShow);
        createdShows.push(savedShow);
      }

      return createdShows;
    } catch (error) {
      console.error('❌ Error creating recurring shows:', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError(
        ERROR_MESSAGES.DATABASE.RECORD_NOT_SAVED,
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
