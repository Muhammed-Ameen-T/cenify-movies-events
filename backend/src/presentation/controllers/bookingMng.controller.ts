import 'reflect-metadata';
import { NextFunction, Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { sendResponse } from '../../utils/response/sendResponse.utils';
import { HttpResCode, HttpResMsg } from '../../utils/constants/httpResponseCode.utils';
import { CustomError } from '../../utils/errors/custom.error';
import { CreateBookingDTO } from '../../application/dtos/booking.dto';
import { IBookingMngController } from './interface/bookingMng.controller.interface';
import { ICreateBookingUseCase } from '../../domain/interfaces/useCases/User/createBooking.interface';
import { IFetchAllBookingsUseCase } from '../../domain/interfaces/useCases/User/fetchBookings.interface';
import { IFindBookingByIdUseCase } from '../../domain/interfaces/useCases/User/findBookingById.interface';
import { IFindBookingsOfUserUseCase } from '../../domain/interfaces/useCases/User/findBookingsOfUser.interface';
import { IFindBookingsOfVendorUseCase } from '../../domain/interfaces/useCases/User/findBookingsOfVendor.interface';
import { ICancelBookingUseCase } from '../../domain/interfaces/useCases/User/cancelBooking.interface';
import { ICheckPaymentOptionsUseCase } from '../../domain/interfaces/useCases/User/checkPaymentOptions.interface';
import ERROR_MESSAGES from '../../utils/constants/commonErrorMsg.constants';

/**
 * Controller for managing booking-related operations.
 * @implements {IBookingMngController}
 */
@injectable()
export class BookingMngController implements IBookingMngController {
  /**
   * Constructs an instance of BookingMngController.
   * @param {ICreateBookingUseCase} createBookingUseCase - Use case for creating a booking.
   * @param {IFetchAllBookingsUseCase} fetchBookingsUseCase - Use case for fetching all bookings.
   * @param {IFindBookingByIdUseCase} findBookingByIdUseCase - Use case for finding a booking by ID.
   * @param {ICancelBookingUseCase} cancelBookingUseCase - Use case for canceling a booking.
   * @param {IFindBookingsOfUserUseCase} findBookingsOfUserUseCase - Use case for finding bookings of a specific user.
   * @param {IFindBookingsOfVendorUseCase} findBookingsOfVendorUseCase - Use case for finding bookings of a specific vendor.
   * @param {ICheckPaymentOptionsUseCase} checkPaymentOptionsUseCase - Use case for checking payment options.
   */
  constructor(
    @inject('CreateBookingUseCase') private createBookingUseCase: ICreateBookingUseCase,
    @inject('FetchAllBookingsUseCase') private fetchBookingsUseCase: IFetchAllBookingsUseCase,
    @inject('FindBookingByIdUseCase') private findBookingByIdUseCase: IFindBookingByIdUseCase,
    @inject('CancelBookingUseCase') private cancelBookingUseCase: ICancelBookingUseCase,
    @inject('FindBookingsOfUserUseCase')
    private findBookingsOfUserUseCase: IFindBookingsOfUserUseCase,
    @inject('FindBookingsOfVendorUseCase')
    private findBookingsOfVendorUseCase: IFindBookingsOfVendorUseCase,
    @inject('CheckPaymentOptionsUseCase')
    private checkPaymentOptionsUseCase: ICheckPaymentOptionsUseCase,
  ) {}

  /**
   * Handles the creation of a new booking.
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   * @returns {Promise<void>}
   */
  async createBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.decoded?.userId;
      if (!userId) {
        throw new CustomError(HttpResMsg.UNAUTHORIZED, HttpResCode.UNAUTHORIZED);
      }
      const dto = new CreateBookingDTO(
        req.body.showId,
        userId,
        req.body.bookedSeatsId,
        req.body.payment,
        req.body.subTotal,
        req.body.convenienceFee,
        req.body.donation,
        req.body.totalAmount,
        req.body.couponDiscount,
        req.body.couponApplied,
        req.body.moviePassApplied,
        req.body.moviePassDiscount,
        new Date(Date.now() + 5 * 60 * 1000), // 5-minute expiry
      );

      const result = await this.createBookingUseCase.execute(dto);
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Checks available payment options for a given total amount.
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   * @returns {Promise<void>}
   */
  async checkPaymentOptions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.decoded?.userId;
      if (!userId) {
        throw new CustomError(HttpResMsg.UNAUTHORIZED, HttpResCode.UNAUTHORIZED);
      }

      const totalAmount = parseFloat(req.query.totalAmount as string);
      if (isNaN(totalAmount)) {
        throw new CustomError(
          ERROR_MESSAGES.VALIDATION.INVALID_TOTAL_AMOUNT,
          HttpResCode.BAD_REQUEST,
        );
      }

      const response = await this.checkPaymentOptionsUseCase.execute(userId, totalAmount);
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetches all bookings based on provided query parameters.
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   * @returns {Promise<void>}
   */
  async fetchBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, search, status, sortBy, sortOrder } = req.query;
      // Convert query parameters
      const params: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string[];
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
      } = {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        search: search ? (search as string) : undefined,
        status: status ? (status as string).split(',') : undefined,
        sortBy: sortBy ? (sortBy as string) : undefined,
        sortOrder: sortOrder ? (sortOrder as 'asc' | 'desc') : undefined,
      };

      const result = await this.fetchBookingsUseCase.execute(params);
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Finds bookings associated with a specific vendor.
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   * @returns {Promise<void>}
   */
  async findBookingsOfVendor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, status, sortBy, sortOrder } = req.query;
      const vendorId = req.decoded?.userId;
      if (!vendorId) {
        throw new CustomError(HttpResMsg.UNAUTHORIZED, HttpResCode.UNAUTHORIZED);
      }
      // Convert query parameters
      const params: {
        vendorId: string;
        page?: number;
        limit?: number;
        status?: string[];
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
      } = {
        vendorId: vendorId as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        status: status ? (status as string).split(',') : undefined,
        sortBy: sortBy ? (sortBy as string) : undefined,
        sortOrder: sortOrder ? (sortOrder as 'asc' | 'desc') : undefined,
      };

      const result = await this.findBookingsOfVendorUseCase.execute(params);
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Finds a specific booking by its ID.
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   * @returns {Promise<void>}
   */
  async findBookingById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        throw new CustomError('Missing booking ID', HttpResCode.BAD_REQUEST);
      }

      const booking = await this.findBookingByIdUseCase.execute(id);
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, booking);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Finds bookings associated with a specific user.
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   * @returns {Promise<void>}
   */
  async findBookingsOfUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, status, sortBy, sortOrder } = req.query;
      const userId = req.decoded?.userId;
      if (!userId) {
        throw new CustomError(HttpResMsg.UNAUTHORIZED, HttpResCode.UNAUTHORIZED);
      }
      // Convert query parameters
      const params: {
        userId: string;
        page?: number;
        limit?: number;
        status?: string[];
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
      } = {
        userId: userId as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        status: status ? (status as string).split(',') : undefined,
        sortBy: sortBy ? (sortBy as string) : undefined,
        sortOrder: sortOrder ? (sortOrder as 'asc' | 'desc') : undefined,
      };

      const result = await this.findBookingsOfUserUseCase.execute(params);
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancels a booking by its ID.
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   * @returns {Promise<void>}
   */
  async cancelBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      if (!id) {
        throw new CustomError('Missing booking ID', HttpResCode.BAD_REQUEST);
      }

      const cancelledBooking = await this.cancelBookingUseCase.execute(id, reason);
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, cancelledBooking);
    } catch (error) {
      next(error);
    }
  }
}
