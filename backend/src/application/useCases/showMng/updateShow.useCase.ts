import { inject, injectable } from 'tsyringe';
import { Show } from '../../../domain/entities/show.entity';
import { IShowRepository } from '../../../domain/interfaces/repositories/show.repository';
import { IScreenRepository } from '../../../domain/interfaces/repositories/screen.repository';
import { IMovieRepository } from '../../../domain/interfaces/repositories/movie.repository';
import { ITheaterRepository } from '../../../domain/interfaces/repositories/theater.repository';
import { UpdateShowDTO } from '../../dtos/show.dto';
import { IUpdateShowUseCase } from '../../../domain/interfaces/useCases/Vendor/updateShow.interface';
import { CustomError } from '../../../utils/errors/custom.error';
import { HttpResCode } from '../../../utils/constants/httpResponseCode.utils';
import ERROR_MESSAGES from '../../../utils/constants/commonErrorMsg.constants';
import mongoose from 'mongoose';

@injectable()
export class UpdateShowUseCase implements IUpdateShowUseCase {
  constructor(
    @inject('ShowRepository') private showRepository: IShowRepository,
    @inject('ScreenRepository') private screenRepository: IScreenRepository,
    @inject('MovieRepository') private movieRepository: IMovieRepository,
    @inject('TheaterRepository') private theaterRepository: ITheaterRepository,
  ) {}

  async execute(dto: UpdateShowDTO): Promise<Show> {
    try {
      // Validate Show Existence
      const existingShow = await this.showRepository.findById(dto.id);
      if (!existingShow) {
        throw new CustomError(ERROR_MESSAGES.VALIDATION.SHOW_NOT_FOUND, HttpResCode.BAD_REQUEST);
      }

      if (existingShow.status === 'Running') {
        throw new CustomError(ERROR_MESSAGES.VALIDATION.SHOW_RUNNING, HttpResCode.BAD_REQUEST);
      }
      if (existingShow.status === 'Completed') {
        throw new CustomError(ERROR_MESSAGES.VALIDATION.SHOW_COMPLETED, HttpResCode.BAD_REQUEST);
      }
      if (existingShow.status === 'Cancelled') {
        throw new CustomError(ERROR_MESSAGES.VALIDATION.SHOW_CANCELLED, HttpResCode.BAD_REQUEST);
      }

      // Fetch Movie Duration
      const movieId = dto.movieId || existingShow.movieId;
      const movie = await this.movieRepository.findById(movieId);
      if (!movie || !movie.duration) {
        throw new CustomError(ERROR_MESSAGES.VALIDATION.MOVIE_NOT_FOUND, HttpResCode.BAD_REQUEST);
      }

      const { hours, minutes, seconds } = movie.duration;
      const movieDurationMs = (hours * 3600 + minutes * 60 + seconds) * 1000;

      // Fetch Theater Interval Gap
      const theaterId = dto.theaterId || existingShow.theaterId;
      const theater = await this.theaterRepository.findById(theaterId);
      if (!theater || typeof theater.intervalTime !== 'number') {
        throw new CustomError(ERROR_MESSAGES.VALIDATION.THEATER_NOT_FOUND, HttpResCode.BAD_REQUEST);
      }

      const intervalGapMs = theater.intervalTime * 60000;

      // Validate and Parse Start Time
      let startTime: Date;
      if (dto.startTime) {
        startTime = new Date(dto.startTime);
        if (isNaN(startTime.getTime())) {
          throw new CustomError(
            ERROR_MESSAGES.VALIDATION.INVALID_START_TIME,
            HttpResCode.BAD_REQUEST,
          );
        }
      } else {
        startTime = existingShow.startTime;
      }

      // Calculate or Validate End Time
      let endTime: Date;
      if (dto.endTime) {
        endTime = new Date(dto.endTime);
        if (isNaN(endTime.getTime())) {
          throw new CustomError(
            ERROR_MESSAGES.VALIDATION.INVALID_END_TIME,
            HttpResCode.BAD_REQUEST,
          );
        }
        // Verify endTime matches expected duration
        const expectedEndTime = new Date(startTime.getTime() + movieDurationMs + intervalGapMs);
        if (Math.abs(endTime.getTime() - expectedEndTime.getTime()) > 1000) {
          throw new CustomError(
            ERROR_MESSAGES.VALIDATION.INVALID_END_TIME,
            HttpResCode.BAD_REQUEST,
          );
        }
      } else {
        endTime = new Date(startTime.getTime() + movieDurationMs + intervalGapMs);
      }

      // Validate Show Date
      let showDate: Date;
      if (dto.date) {
        showDate = new Date(dto.date);
        if (isNaN(showDate.getTime())) {
          throw new CustomError(ERROR_MESSAGES.VALIDATION.INVALID_DATE, HttpResCode.BAD_REQUEST);
        }
      } else {
        showDate = existingShow.showDate ?? new Date();
      }

      // Ensure startTime aligns with showDate
      const startTimeDate = new Date(startTime);
      startTimeDate.setFullYear(showDate.getFullYear(), showDate.getMonth(), showDate.getDate());
      const adjustedStartTime = startTimeDate;
      const adjustedEndTime = new Date(
        adjustedStartTime.getTime() + movieDurationMs + intervalGapMs,
      );

      // Check if Time Slot is Available
      const isSlotAvailable = await this.screenRepository.checkSlot(
        dto.screenId || existingShow.screenId,
        adjustedStartTime,
        adjustedEndTime,
        dto.id,
      );
      if (!isSlotAvailable) {
        throw new CustomError(
          ERROR_MESSAGES.VALIDATION.SHOW_TIME_CONFLICT,
          HttpResCode.BAD_REQUEST,
        );
      }

      // Update Show
      const updatedShow = new Show(
        dto.id,
        adjustedStartTime,
        new mongoose.Types.ObjectId(movieId),
        new mongoose.Types.ObjectId(theaterId),
        new mongoose.Types.ObjectId(dto.screenId || existingShow.screenId),
        new mongoose.Types.ObjectId(existingShow.vendorId),
        existingShow.status,
        existingShow.bookedSeats,
        adjustedEndTime,
        showDate,
      );

      return await this.showRepository.update(updatedShow, existingShow.startTime);
    } catch (error) {
      console.error('❌ Error updating show:', error);
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
