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
      const existingShow = await this.showRepository.findById(dto.id);
      if (!existingShow) {
        throw new CustomError(ERROR_MESSAGES.VALIDATION.SHOW_NOT_FOUND, HttpResCode.BAD_REQUEST);
      }

      if (['Running', 'Completed', 'Cancelled'].includes(existingShow.status)) {
        throw new CustomError(
          `Cannot update a ${existingShow.status.toLowerCase()} show`,
          HttpResCode.BAD_REQUEST,
        );
      }

      const movieId = dto.movieId || existingShow.movieId;
      const movie = await this.movieRepository.findById(movieId);
      if (!movie || !movie.duration) {
        throw new CustomError(ERROR_MESSAGES.VALIDATION.MOVIE_NOT_FOUND, HttpResCode.BAD_REQUEST);
      }

      const { hours, minutes, seconds } = movie.duration;
      const movieDurationMs = (hours * 3600 + minutes * 60 + seconds) * 1000;

      const theaterId = dto.theaterId || existingShow.theaterId;
      const theater = await this.theaterRepository.findById(theaterId);
      if (!theater || typeof theater.intervalTime !== 'number') {
        throw new CustomError(ERROR_MESSAGES.VALIDATION.THEATER_NOT_FOUND, HttpResCode.BAD_REQUEST);
      }

      const intervalGapMs = theater.intervalTime * 60000;

      let startTime = dto.startTime ? new Date(dto.startTime) : existingShow.startTime;
      if (isNaN(startTime.getTime())) {
        throw new CustomError(
          ERROR_MESSAGES.VALIDATION.INVALID_START_TIME,
          HttpResCode.BAD_REQUEST,
        );
      }

      let showDate: Date;
      if (dto.showDate) {
        showDate = new Date(dto.showDate);
        if (isNaN(showDate.getTime())) {
          throw new CustomError(ERROR_MESSAGES.VALIDATION.INVALID_DATE, HttpResCode.BAD_REQUEST);
        }
      } else {
        showDate = existingShow.showDate ?? new Date();
      }

      // Ensure startTime aligns with showDate
      const adjustedStartTime = new Date(startTime);
      adjustedStartTime.setFullYear(
        showDate.getFullYear(),
        showDate.getMonth(),
        showDate.getDate(),
      );

      const adjustedEndTime = new Date(
        adjustedStartTime.getTime() + movieDurationMs + intervalGapMs,
      );

      if (dto.endTime) {
        const providedEndTime = new Date(dto.endTime);
        if (Math.abs(providedEndTime.getTime() - adjustedEndTime.getTime()) > 1000) {
          throw new CustomError(
            ERROR_MESSAGES.VALIDATION.INVALID_END_TIME,
            HttpResCode.BAD_REQUEST,
          );
        }
      }

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
      if (error instanceof CustomError) throw error;
      throw new CustomError(
        ERROR_MESSAGES.DATABASE.RECORD_NOT_SAVED,
        HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
