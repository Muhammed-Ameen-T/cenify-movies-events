// src/interfaces/http/controllers/seatSelection.controller.ts
import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { sendResponse } from '../../utils/response/sendResponse.utils';
import { HttpResCode, HttpResMsg } from '../../utils/constants/httpResponseCode.utils';
import { CustomError } from '../../utils/errors/custom.error';
// import { SocketService } from '../../infrastructure/services/socket.service';
import { ISelectSeatsUseCase } from '../../domain/interfaces/useCases/User/selectSeats.interface';
import { IFetchSeatSelectionUseCase } from '../../domain/interfaces/useCases/User/fetchSeatSelection.interface';
import ERROR_MESSAGES from '../../utils/constants/commonErrorMsg.constants';
import mongoose from 'mongoose';
import { ISeatSelectionController } from './interface/seatSelection.controller.interface';

@injectable()
export class SeatSelectionController implements ISeatSelectionController {
  constructor(
    @inject('FetchSeatSelectionUseCase')
    private fetchSeatSelectionUseCase: IFetchSeatSelectionUseCase,
    @inject('SelectSeatsUseCase') private selectSeatsUseCase: ISelectSeatsUseCase,
    // @inject('SocketService') private socketService: SocketService,
  ) {}

  async getSeatSelection(req: Request, res: Response): Promise<void> {
    try {
      const { showId } = req.params;
      // const userId = req.decoded?.userId;

      // if (!userId) {
      //   throw new CustomError(HttpResMsg.UNAUTHORIZED, HttpResCode.UNAUTHORIZED);
      // }

      if (!mongoose.Types.ObjectId.isValid(showId)) {
        throw new CustomError('Invalid show ID', HttpResCode.BAD_REQUEST);
      }

      const result = await this.fetchSeatSelectionUseCase.execute(showId);
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, result);
    } catch (error: any) {
      console.error('❌ ~ SeatSelectionController ~ getSeatSelection ~ Error:', error);
      sendResponse(
        res,
        error instanceof CustomError ? error.statusCode : HttpResCode.INTERNAL_SERVER_ERROR,
        error.message || ERROR_MESSAGES.GENERAL.FAILED_FINDING_SEATS,
      );
    }
  }

  async selectSeats(req: Request, res: Response): Promise<void> {
    try {
      const { showId } = req.params;
      const { seatIds } = req.body;
      const userId = req.decoded?.userId;

      if (!userId) {
        throw new CustomError(HttpResMsg.UNAUTHORIZED, HttpResCode.UNAUTHORIZED);
      }

      if (!mongoose.Types.ObjectId.isValid(showId)) {
        throw new CustomError('Invalid show ID', HttpResCode.BAD_REQUEST);
      }

      if (!Array.isArray(seatIds) || seatIds.length === 0) {
        throw new CustomError('Invalid seat selection', HttpResCode.BAD_REQUEST);
      }

      const result = await this.selectSeatsUseCase.execute({ showId, seatIds, userId });
      // this.socketService.emitSeatUpdate(showId, seatIds, 'pending');
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, result);
    } catch (error: any) {
      console.error('❌ ~ SeatSelectionController ~ selectSeats ~ Error:', error);
      // this.socketService.emitError(req.socketId || '', error.message);
      sendResponse(
        res,
        error instanceof CustomError ? error.statusCode : HttpResCode.INTERNAL_SERVER_ERROR,
        error.message || ERROR_MESSAGES.GENERAL.FAILED_SELECTING_SEATS,
      );
    }
  }
}
