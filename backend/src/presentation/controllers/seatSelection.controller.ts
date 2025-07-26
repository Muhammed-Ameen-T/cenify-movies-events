// src/interfaces/http/controllers/seatSelection.controller.ts
import { NextFunction, Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { sendResponse } from '../../utils/response/sendResponse.utils';
import { HttpResCode, HttpResMsg } from '../../utils/constants/httpResponseCode.utils';
import { CustomError } from '../../utils/errors/custom.error';
import { ISelectSeatsUseCase } from '../../domain/interfaces/useCases/User/selectSeats.interface';
import { IFetchSeatSelectionUseCase } from '../../domain/interfaces/useCases/User/fetchSeatSelection.interface';
import mongoose from 'mongoose';
import { ISeatSelectionController } from './interface/seatSelection.controller.interface';

/**
 * Controller for handling seat selection and retrieval for shows.
 * @implements {ISeatSelectionController}
 */
@injectable()
export class SeatSelectionController implements ISeatSelectionController {
  /**
   * Constructs an instance of SeatSelectionController.
   * @param {IFetchSeatSelectionUseCase} fetchSeatSelectionUseCase - Use case for fetching seat selection status for a show.
   * @param {ISelectSeatsUseCase} selectSeatsUseCase - Use case for selecting/reserving seats.
   */
  constructor(
    @inject('FetchSeatSelectionUseCase')
    private fetchSeatSelectionUseCase: IFetchSeatSelectionUseCase,
    @inject('SelectSeatsUseCase') private selectSeatsUseCase: ISelectSeatsUseCase,
  ) {}

  /**
   * Retrieves the current seat selection status for a given show.
   * @param {Request} req - The Express request object, containing `showId` in `req.params`.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   * @returns {Promise<void>}
   */
  async getSeatSelection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { showId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(showId)) {
        throw new CustomError('Invalid show ID', HttpResCode.BAD_REQUEST);
      }

      const result = await this.fetchSeatSelectionUseCase.execute(showId);
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles the selection/reservation of seats for a specific show by a user.
   * @param {Request} req - The Express request object, containing `showId` in `req.params`, `seatIds` in `req.body`, and `userId` in `req.decoded`.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   * @returns {Promise<void>}
   */
  async selectSeats(req: Request, res: Response, next: NextFunction): Promise<void> {
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
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, result);
    } catch (error) {
      next(error);
    }
  }
}
