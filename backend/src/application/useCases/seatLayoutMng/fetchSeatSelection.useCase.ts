// src/application/useCases/User/fetchSeatSelection.useCase.ts
import { injectable, inject } from 'tsyringe';
import { IFetchSeatSelectionUseCase } from '../../../domain/interfaces/useCases/User/fetchSeatSelection.interface';
import { IShowRepository } from '../../../domain/interfaces/repositories/show.repository';
import { ISeatLayoutRepository } from '../../../domain/interfaces/repositories/seatLayout.repository';
import { IScreenRepository } from '../../../domain/interfaces/repositories/screen.repository';
import { SeatSelectionResponseDTO, SeatDTO } from '../../../application/dtos/seatSelection.dto';
import { CustomError } from '../../../utils/errors/custom.error';
import { HttpResCode } from '../../../utils/constants/httpResponseCode.utils';
import ERROR_MESSAGES from '../../../utils/constants/commonErrorMsg.constants';
import { ISeatRepository } from '../../../domain/interfaces/repositories/seat.repository';

@injectable()
export class FetchSeatSelectionUseCase implements IFetchSeatSelectionUseCase {
  constructor(
    @inject('ShowRepository') private showRepository: IShowRepository,
    @inject('SeatLayoutRepository') private seatLayoutRepository: ISeatLayoutRepository,
    @inject('ScreenRepository') private screenRepository: IScreenRepository,
    @inject('SeatRepository') private seatRepository: ISeatRepository,
  ) {}

  async execute(showId: string): Promise<SeatSelectionResponseDTO> {
    try {
      // Fetch show details
      const show = await this.showRepository.findById(showId);
      if (!show) {
        throw new CustomError(ERROR_MESSAGES.VALIDATION.SHOW_NOT_FOUND, HttpResCode.BAD_REQUEST);
      }

      // Fetch seat layout
      const screen = await this.screenRepository.findById(show.screenId);
      if (!screen) {
        throw new CustomError(ERROR_MESSAGES.VALIDATION.SCREEN_NOT_FOUND, HttpResCode.BAD_REQUEST);
      }

      if (!screen.seatLayoutId) {
        throw new CustomError(
          ERROR_MESSAGES.VALIDATION.SEAT_LAYOUT_NOT_FOUND,
          HttpResCode.BAD_REQUEST,
        );
      }
      const seatLayout = await this.seatLayoutRepository.findById(
        screen.seatLayoutId._id.toString(),
      );
      if (!seatLayout) {
        throw new CustomError(
          ERROR_MESSAGES.VALIDATION.SEAT_LAYOUT_NOT_FOUND,
          HttpResCode.BAD_REQUEST,
        );
      }

      // Fetch seats
      const seats = await this.seatRepository.findSeatsByLayoutId(seatLayout._id?.toString() || '');
      const bookedSeats = show.bookedSeats || [];

      // Map seats to DTO
      const seatDTOs: SeatDTO[] = seats.map((seat) => {
        const bookedSeat = bookedSeats.find((bs) => bs.seatNumber === seat.number);
        return {
          id: seat._id ? seat._id.toString() : '',
          number: seat.number,
          type: seat.type,
          price: seat.price,
          status: bookedSeat
            ? bookedSeat.isPending
              ? 'pending'
              : 'booked'
            : seat.type === 'Unavailable'
              ? 'unavailable'
              : 'available',
          position: seat.position,
        };
      });

      return {
        seats: seatDTOs,
        seatLayout: {
          rowCount: seatLayout.rowCount,
          columnCount: seatLayout.columnCount,
          capacity: seatLayout.capacity,
          seatPrices: seatLayout.seatPrice,
        },
        showDetails: {
          showId: show._id,
          movieTitle: show.movieId?.name || 'Unknown Movie',
          movieId: show.movieId._id,
          theaterName: show.theaterId?.name || 'Unknown Theater',
          theaterCity: show.theaterId?.location.city || 'Unknown City',
          screenName: show.screenId?.name || 'Unknown Screen',
          date: show.showDate ? show.showDate.toISOString().split('T')[0] : '',
          time: show.startTime.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }),
        },
      };
    } catch (error) {
      console.error('❌ Error fetching seat selection:', error);
      throw new CustomError(
        error instanceof CustomError ? error.message : ERROR_MESSAGES.GENERAL.FAILED_FINDING_SEATS,
        error instanceof CustomError ? error.statusCode : HttpResCode.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
