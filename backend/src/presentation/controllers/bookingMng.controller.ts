import 'reflect-metadata';
import { NextFunction, Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { sendResponse } from '../../utils/response/sendResponse.utils';
import { HttpResCode, HttpResMsg } from '../../utils/constants/httpResponseCode.utils';
import ERROR_MESSAGES from '../../utils/constants/commonErrorMsg.constants';
import { CustomError } from '../../utils/errors/custom.error';
import { CreateBookingDTO } from '../../application/dtos/booking.dto';
import { IBookingMngController } from './interface/bookingMng.controller.interface';
import { ICreateBookingUseCase } from '../../domain/interfaces/useCases/User/createBooking.interface';
import { IFetchAllBookingsUseCase } from '../../domain/interfaces/useCases/User/fetchBookings.interface';
import { IFindBookingByIdUseCase } from '../../domain/interfaces/useCases/User/findBookingById.interface';
import { IFindBookingsOfUserUseCase } from '../../domain/interfaces/useCases/User/findBookingsOfUser.interface';
import { PaymentService } from '../../infrastructure/services/checkoutPayment.service';
import { IWalletRepository } from '../../domain/interfaces/repositories/wallet.repository';
import { IMoviePassRepository } from '../../domain/interfaces/repositories/moviePass.repository';
import { IFindBookingsOfVendorUseCase } from '../../domain/interfaces/useCases/User/findBookingsOfVendor.interface';
import { ICancelBookingUseCase } from '../../domain/interfaces/useCases/User/cancelBooking.interface';

@injectable()
export class BookingMngController implements IBookingMngController {
  constructor(
    @inject('CreateBookingUseCase') private createBookingUseCase: ICreateBookingUseCase,
    @inject('FetchAllBookingsUseCase') private fetchBookingsUseCase: IFetchAllBookingsUseCase,
    @inject('FindBookingByIdUseCase') private findBookingByIdUseCase: IFindBookingByIdUseCase,
    @inject('CancelBookingUseCase') private cancelBookingUseCase: ICancelBookingUseCase,
    @inject('FindBookingsOfUserUseCase')
    private findBookingsOfUserUseCase: IFindBookingsOfUserUseCase,
    @inject('FindBookingsOfVendorUseCase')
    private findBookingsOfVendorUseCase: IFindBookingsOfVendorUseCase,
    @inject('PaymentService') private paymentService: PaymentService,
    @inject('WalletRepository') private walletRepository: IWalletRepository,
    @inject('MoviePassRepository') private moviePassRepository: IMoviePassRepository,
  ) {}

  async createBooking(req: Request, res: Response, next:NextFunction): Promise<void> {
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
      next(error)
    }
  }

  async checkPaymentOptions(req: Request, res: Response, next:NextFunction): Promise<void> {
    try {
      const userId = req.decoded?.userId;
      if (!userId) {
        throw new CustomError(HttpResMsg.UNAUTHORIZED, HttpResCode.UNAUTHORIZED);
      }
      const totalAmount = parseFloat(req.query.totalAmount as string);
      if (isNaN(totalAmount)) {
        throw new CustomError('Invalid total amount', HttpResCode.BAD_REQUEST);
      }

      const hasSufficientWalletBalance = await this.paymentService.checkWalletBalance(
        userId,
        totalAmount,
      );
      const hasMoviePass = await this.moviePassRepository.findByUserId(userId);
      const isMoviePassActive = hasMoviePass && hasMoviePass.status === 'Active';
      const wallet = await this.walletRepository.findByUserId(userId);
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, {
        wallet: { enabled: hasSufficientWalletBalance, balance: wallet?.balance || 0 },
        stripe: { enabled: true },
        moviePass: { active: isMoviePassActive },
      });
    } catch (error) {
      next(error)
    }
  }

  async fetchBookings(req: Request, res: Response, next:NextFunction): Promise<void> {
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
      next(error)
    }
  }

  async findBookingsOfVendor(req: Request, res: Response, next:NextFunction): Promise<void> {
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
     next(error)
    }
  }

  async findBookingById(req: Request, res: Response, next:NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        throw new CustomError('Missing booking ID', HttpResCode.BAD_REQUEST);
      }

      const booking = await this.findBookingByIdUseCase.execute(id);
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, booking);
    } catch (error) {
next(error)    }
  }

  async findBookingsOfUser(req: Request, res: Response, next:NextFunction): Promise<void> {
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
      next(error)
    }
  }

  async cancelBooking(req: Request, res: Response, next:NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      if (!id) {
        throw new CustomError('Missing booking ID', HttpResCode.BAD_REQUEST);
      }

      const cancelledBooking = await this.cancelBookingUseCase.execute(id, reason);
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, cancelledBooking);
    } catch (error) {
      next(error)
    }
  }
}
