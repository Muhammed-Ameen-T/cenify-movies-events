import { inject, injectable } from 'tsyringe';
import { Show } from '../../../domain/entities/show.entity';
import { IShowRepository } from '../../../domain/interfaces/repositories/show.repository';
import { IScreenRepository } from '../../../domain/interfaces/repositories/screen.repository';
import { IMovieRepository } from '../../../domain/interfaces/repositories/movie.repository';
import { ITheaterRepository } from '../../../domain/interfaces/repositories/theater.repository';
import { CreateShowDTO } from '../../dtos/show.dto';
import { ICreateShowUseCase } from '../../../domain/interfaces/useCases/Vendor/createShow.interface';
import { CustomError } from '../../../utils/errors/custom.error';
import { HttpResCode } from '../../../utils/constants/httpResponseCode.utils';
import ERROR_MESSAGES from '../../../utils/constants/commonErrorMsg.constants';
import mongoose from 'mongoose';

@injectable()
export class CreateShowUseCase implements ICreateShowUseCase {
  constructor(
    @inject('ShowRepository') private showRepository: IShowRepository,
    @inject('ScreenRepository') private screenRepository: IScreenRepository,
    @inject('MovieRepository') private movieRepository: IMovieRepository,
    @inject('TheaterRepository') private theaterRepository: ITheaterRepository,
  ) {}

  async execute(vendorId: string, dto: CreateShowDTO): Promise<Show[]> {
    try {
      // Validate input
      if (!dto.showTimes || !Array.isArray(dto.showTimes) || dto.showTimes.length === 0) {
        throw new CustomError(
          ERROR_MESSAGES.VALIDATION.SHOW_TIMES_REQUIRED,
          HttpResCode.BAD_REQUEST,
        );
      }

      // Fetch Movie Duration
      const movie = await this.movieRepository.findById(dto.movieId);
      if (!movie || !movie.duration) {
        throw new CustomError(ERROR_MESSAGES.VALIDATION.MOVIE_NOT_FOUND, HttpResCode.BAD_REQUEST);
      }
      const { hours, minutes, seconds } = movie.duration;
      const movieDurationMs = (hours * 3600 + minutes * 60 + seconds) * 1000;

      // Fetch Theater Interval Gap
      const theater = await this.theaterRepository.findById(dto.theaterId);
      if (!theater || typeof theater.intervalTime !== 'number') {
        throw new CustomError(ERROR_MESSAGES.VALIDATION.THEATER_NOT_FOUND, HttpResCode.BAD_REQUEST);
      }
      const intervalGapMs = theater.intervalTime * 60 * 1000;
      if (theater.status != 'verified') {
        throw new CustomError(
          ERROR_MESSAGES.VALIDATION.THEATER_NOT_VERIFIED,
          HttpResCode.BAD_REQUEST,
        );
      }

      // Parse show date
      const showDate = new Date(dto.date);
      if (isNaN(showDate.getTime())) {
        throw new CustomError(ERROR_MESSAGES.VALIDATION.INVALID_DATE, HttpResCode.BAD_REQUEST);
      }

      // Create shows for each show time
      const createdShows: Show[] = [];
      for (const showTime of dto.showTimes) {
        const startTime = new Date(showTime.startTime);
        const endTime = new Date(showTime.endTime);

        // Validate startTime and endTime
        if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
          throw new CustomError(ERROR_MESSAGES.VALIDATION.INVALID_TIME, HttpResCode.BAD_REQUEST);
        }

        // Verify endTime matches expected duration
        const expectedEndTime = new Date(startTime.getTime() + movieDurationMs + intervalGapMs);
        if (endTime.getTime() !== expectedEndTime.getTime()) {
          throw new CustomError(
            ERROR_MESSAGES.VALIDATION.INVALID_END_TIME,
            HttpResCode.BAD_REQUEST,
          );
        }

        // Check if time slot is available
        const isSlotAvailable = await this.screenRepository.checkSlot(
          dto.screenId,
          startTime,
          endTime,
        );
        if (!isSlotAvailable) {
          throw new CustomError(
            ERROR_MESSAGES.VALIDATION.SHOW_TIME_CONFLICT,
            HttpResCode.BAD_REQUEST,
          );
        }

        // Create Show
        const newShow = new Show(
          null as any,
          startTime,
          new mongoose.Types.ObjectId(dto.movieId),
          new mongoose.Types.ObjectId(dto.theaterId),
          new mongoose.Types.ObjectId(dto.screenId),
          new mongoose.Types.ObjectId(vendorId),
          'Scheduled',
          [],
          endTime,
          showDate, // Set showDate
        );

        const savedShow = await this.showRepository.create(newShow);
        createdShows.push(savedShow);
      }

      return createdShows;
    } catch (error) {
      console.error('❌ Error creating shows:', error);
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
