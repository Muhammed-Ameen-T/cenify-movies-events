import 'reflect-metadata';
import { Request, Response } from 'express';
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

  async createBooking(req: Request, res: Response): Promise<void> {
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
      console.log('🚀 ~ BookingMngController ~ createBooking ~ req.body:', req.body);

      const result = await this.createBookingUseCase.execute(dto);
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, result);
    } catch (error: any) {
      const errorMessage =
        error instanceof CustomError ? error.message : 'Failed to create booking';
      sendResponse(res, HttpResCode.BAD_REQUEST, errorMessage);
    }
  }

  async checkPaymentOptions(req: Request, res: Response): Promise<void> {
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
    } catch (error: any) {
      const errorMessage =
        error instanceof CustomError ? error.message : 'Failed to check payment options';
      sendResponse(res, HttpResCode.BAD_REQUEST, errorMessage);
    }
  }

  async fetchBookings(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, search, status, sortBy, sortOrder } = req.query;
      console.log('🚀 ~ BookingMngController ~ fetchBookings ~ req.query:', req.query);
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
      const errorMessage =
        error instanceof CustomError ? error.message : ERROR_MESSAGES.DATABASE.RECORD_NOT_FOUND;
      sendResponse(res, HttpResCode.NOT_FOUND, errorMessage);
    }
  }

  async findBookingsOfVendor(req: Request, res: Response): Promise<void> {
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
      console.log('🚀 ~ BookingMngController ~ findBookingsOfVendor ~ result:', result);
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, result);
    } catch (error) {
      const errorMessage =
        error instanceof CustomError ? error.message : ERROR_MESSAGES.DATABASE.RECORD_NOT_FOUND;
      sendResponse(res, HttpResCode.NOT_FOUND, errorMessage);
    }
  }

  async findBookingById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      console.log('🚀 ~ BookingMngController ~ findBookingById ~ id:', id);
      if (!id) {
        throw new CustomError('Missing booking ID', HttpResCode.BAD_REQUEST);
      }

      const booking = await this.findBookingByIdUseCase.execute(id);
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, booking);
    } catch (error) {
      sendResponse(res, HttpResCode.NOT_FOUND, ERROR_MESSAGES.DATABASE.RECORD_NOT_FOUND);
    }
  }

  async findBookingsOfUser(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, status, sortBy, sortOrder } = req.query;
      console.log('🚀 ~ BookingMngController ~ findBookingsOfUser ~ req.query:', req.query);
      const userId = req.decoded?.userId;
      if (!userId) {
        throw new CustomError(HttpResMsg.UNAUTHORIZED, HttpResCode.UNAUTHORIZED);
      }
      console.log('🚀 ~ BookingMngController ~ findBookingsOfUser ~ userId:', userId);
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
      console.log('🚀 ~ BookingMngController ~ findBookingsOfUser ~ result:', result);
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, result);
    } catch (error) {
      const errorMessage =
        error instanceof CustomError ? error.message : ERROR_MESSAGES.DATABASE.RECORD_NOT_FOUND;
      sendResponse(res, HttpResCode.NOT_FOUND, errorMessage);
    }
  }

  async cancelBooking(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const {reason} = req.body;
      console.log('🚀 ~ BookingMngController ~ cancelBooking ~ id:', id);

      if (!id) {
        throw new CustomError('Missing booking ID', HttpResCode.BAD_REQUEST);
      }

      const cancelledBooking = await this.cancelBookingUseCase.execute(id,reason);
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, cancelledBooking);
    } catch (error: any) {
      console.error('❌ ~ BookingMngController ~ cancelBooking ~ error:', error);
      sendResponse(
        res,
        HttpResCode.BAD_REQUEST,
        error.message || ERROR_MESSAGES.GENERAL.FAILED_CANCELLING_BOOKING,
      );
    }
  }
}
