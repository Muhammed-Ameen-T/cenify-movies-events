import { injectable, inject } from 'tsyringe';
import { IShowRepository } from '../../../domain/interfaces/repositories/show.repository';
import { SelectSeatDTO } from '../../../application/dtos/seatSelection.dto';
import { CustomError } from '../../../utils/errors/custom.error';
import { HttpResCode } from '../../../utils/constants/httpResponseCode.utils';
import { ISelectSeatsUseCase } from '../../../domain/interfaces/useCases/User/selectSeats.interface';
import ERROR_MESSAGES from '../../../utils/constants/commonErrorMsg.constants';
import mongoose from 'mongoose';
import { ISeatLayoutRepository } from '../../../domain/interfaces/repositories/seatLayout.repository';
import { IScreenRepository } from '../../../domain/interfaces/repositories/screen.repository';
import { ISeatRepository } from '../../../domain/interfaces/repositories/seat.repository';
import { ShowJobService } from '../../../infrastructure/services/showAgenda.service';
import { socketService } from '../../../infrastructure/services/socket.service';

@injectable()
export class SelectSeatsUseCase implements ISelectSeatsUseCase {
  constructor(
    @inject('ShowRepository') private showRepository: IShowRepository,
    @inject('SeatLayoutRepository') private seatLayoutRepository: ISeatLayoutRepository,
    @inject('ScreenRepository') private screenRepository: IScreenRepository,
    @inject('SeatRepository') private seatRepository: ISeatRepository,
    @inject('ShowJobService') private showJobService: ShowJobService,
  ) {
    console.log(
      `SelectSeatsUseCase initialized with SocketService instance ID: ${socketService.getInstanceId()}`,
    );
  }

  async execute(dto: SelectSeatDTO): Promise<{
    selectedSeats: { seatId: string; seatNumber: string; price: number; type: string }[];
  }> {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { showId, seatIds, userId } = dto;

      if (!mongoose.Types.ObjectId.isValid(showId)) {
        throw new CustomError(ERROR_MESSAGES.VALIDATION.SHOW_NOT_FOUND, HttpResCode.BAD_REQUEST);
      }
      if (!Array.isArray(seatIds) || seatIds.length === 0) {
        throw new CustomError(
          ERROR_MESSAGES.GENERAL.INVALID_SEAT_SELECTION,
          HttpResCode.BAD_REQUEST,
        );
      }
      if (!userId) {
        throw new CustomError(
          ERROR_MESSAGES.AUTHENTICATION.USER_NOT_FOUND,
          HttpResCode.UNAUTHORIZED,
        );
      }

      console.log(`Selecting seats for showId: ${showId}, seatIds:`, seatIds);

      const show = await this.showRepository.findByIdSession(showId, session);
      if (!show) {
        throw new CustomError(ERROR_MESSAGES.VALIDATION.SHOW_NOT_FOUND, HttpResCode.BAD_REQUEST);
      }

      const screen = await this.screenRepository.findByIdSession(show.screenId, session);
      if (!screen) {
        throw new CustomError(ERROR_MESSAGES.VALIDATION.SCREEN_NOT_FOUND, HttpResCode.BAD_REQUEST);
      }
      if (!screen.seatLayoutId) {
        throw new CustomError(
          ERROR_MESSAGES.VALIDATION.SEAT_LAYOUT_NOT_FOUND,
          HttpResCode.BAD_REQUEST,
        );
      }

      const seats = await this.seatRepository.findSeatsByIdsSession(
        screen.seatLayoutId._id.toString(),
        seatIds,
        session,
      );

      const bookedSeats = show.bookedSeats || [];
      const invalidSeats = seats.filter((seat) => {
        const booked = bookedSeats.find((bs) => bs.seatNumber === seat.number);
        return booked || seat.type === 'Unavailable';
      });

      if (invalidSeats.length > 0) {
        throw new CustomError(ERROR_MESSAGES.GENERAL.SEATS_ALREADY_FILLED, HttpResCode.BAD_REQUEST);
      }

      const newBookedSeats = seats.map((seat) => ({
        date: new Date(),
        isPending: true,
        seatNumber: String(seat.number),
        seatPrice: Number(seat.price),
        type: String(seat.type),
        position: {
          row: seat.position?.row ?? 0,
          col: seat.position?.col ?? 0,
        },
        userId: String(userId),
      }));

      await this.showRepository.updateBookedSeatsSession(showId, newBookedSeats, session);

      await session.commitTransaction();

      const validSeatIds = seats
        .map((seat) => (seat._id ? seat._id.toString() : null))
        .filter((id): id is string => id !== null);
      if (validSeatIds.length > 0) {
        console.log(
          `Emitting seatUpdate for showId: ${showId}, seatIds:`,
          validSeatIds,
          `SocketService instance ID: ${socketService.getInstanceId()}`,
        );
        socketService.emitSeatUpdate(showId, validSeatIds, 'pending');
      } else {
        console.warn('No valid seat IDs to emit for socket update');
      }

      await this.showJobService.scheduleSeatExpiration(showId);

      return {
        selectedSeats: seats.map((seat) => ({
          seatId: (seat._id as mongoose.Types.ObjectId | string).toString(),
          seatNumber: seat.number,
          price: seat.price,
          type: seat.type,
        })),
      };
    } catch (error) {
      await session.abortTransaction();
      console.error('❌ Error selecting seats:', error);
      throw new CustomError(
        error instanceof CustomError
          ? error.message
          : ERROR_MESSAGES.GENERAL.FAILED_SELECTING_SEATS,
        error instanceof CustomError ? error.statusCode : HttpResCode.INTERNAL_SERVER_ERROR,
      );
    } finally {
      session.endSession();
    }
  }
}
