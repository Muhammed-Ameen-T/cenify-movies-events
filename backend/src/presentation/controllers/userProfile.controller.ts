// src/presentation/controllers/auth.controller.ts
import 'reflect-metadata';
import { NextFunction, Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { container } from 'tsyringe';
import { sendResponse } from '../../utils/response/sendResponse.utils';
import { HttpResCode, HttpResMsg } from '../../utils/constants/httpResponseCode.utils';
import ERROR_MESSAGES from '../../utils/constants/commonErrorMsg.constants';
import { CustomError } from '../../utils/errors/custom.error';
import { JwtService } from '../../infrastructure/services/jwt.service';
import { IgetUserDetailsUseCase } from '../../domain/interfaces/useCases/User/getUserDetails.interface';
import { IupdateUserProfileUseCase } from '../../domain/interfaces/useCases/User/updateUserProfile.interface';
import { ChangePasswordRequestDTO, UpdateProfileRequestDTO } from '../../application/dtos/user.dto';
import { IUserProfileController } from './interface/userProfile.controller.interface';
import { IFindUserWalletUseCase } from '../../domain/interfaces/useCases/User/findUserWallet.interface';
import { IWalletRepository } from '../../domain/interfaces/repositories/wallet.repository';
import { IBookingRepository } from '../../domain/interfaces/repositories/booking.repository';
import { IMoviePassRepository } from '../../domain/interfaces/repositories/moviePass.repository';
import { IChangePasswordUseCase } from '../../domain/interfaces/useCases/User/changePassword.interface';
import { IFindUserWalletTransactionsUseCase } from '../../domain/interfaces/useCases/User/findUserTransaction.interface';
import { IRedeemLoyalityToWalletUseCase } from '../../domain/interfaces/useCases/User/redeemLoyalityToWallet.interface';
import { SendOtpPhoneRequestDTO, VerifyOtpPhoneRequestDTO } from '../../application/dtos/profile.dto';
import { ISendOtpPhoneUseCase } from '../../domain/interfaces/useCases/User/sendOtpPhone.interface';
import { IVerifyOtpPhoneUseCase } from '../../domain/interfaces/useCases/User/verifyOtpPhone.interface';

@injectable()
export class UserProfileController implements IUserProfileController {
  constructor(
    @inject('GetUserDetailsUseCase') private getUserDetailsUseCase: IgetUserDetailsUseCase,
    @inject('UpdateUserProfileUseCase') private updateUserDetailsUseCase: IupdateUserProfileUseCase,
    @inject('FindUserWalletUseCase') private findUserWalletUseCase: IFindUserWalletUseCase,
    @inject('ChangePasswordUseCase') private changePasswordUseCase: IChangePasswordUseCase,
    @inject('WalletTransactionUseCase')
    private findWalletTransaction: IFindUserWalletTransactionsUseCase,
    @inject('RedeemLoyalityToWalletUseCase')
    private redeemLoyalityToWalletUseCase: IRedeemLoyalityToWalletUseCase,
    @inject('BookingRepository') private bookingRepository: IBookingRepository,
    @inject('WalletRepository') private walletRepository: IWalletRepository,
    @inject('MoviePassRepository') private moviePassRepository: IMoviePassRepository,
    @inject('SendOtpPhoneUseCase') private sendOtpPhoneUseCase: ISendOtpPhoneUseCase,
    @inject('VerifyOtpPhoneUseCase') private verifyOtpPhoneUseCase: IVerifyOtpPhoneUseCase,
  ) {}

  async getCurrentUser(req: Request, res: Response, next:NextFunction): Promise<void> {
    try {
      const userId = req.decoded?.userId;
      if (!userId) {
        sendResponse(res, HttpResCode.UNAUTHORIZED, ERROR_MESSAGES.AUTHENTICATION.UNAUTHORIZED);
        return;
      }
      const user = await this.getUserDetailsUseCase.execute(userId);
      if (!user) {
        sendResponse(res, HttpResCode.NOT_FOUND, ERROR_MESSAGES.AUTHENTICATION.USER_NOT_FOUND);
        return;
      }
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, {
        id: user._id?.toString() || '',
        name: user.name,
        email: user.email,
        phone: user.phone ? user.phone : 'N/A',
        profileImage: user.profileImage,
        role: user.role,
        loyalityPoints: user.loyalityPoints || 0,
        dateOfBirth: user.dob ? user.dob : 'N/A',
        joinedDate: user.createdAt.toDateString(),
      });
    } catch (error) {
      next(error)
    }
  }

  async updateUserProfile(req: Request, res: Response, next:NextFunction): Promise<void> {
    const userId = req.decoded?.userId;
    if (!userId) {
      sendResponse(res, HttpResCode.UNAUTHORIZED, ERROR_MESSAGES.AUTHENTICATION.UNAUTHORIZED);
      return;
    }

    try {
      const updateData = new UpdateProfileRequestDTO(
        req.body.name,
        req.body.phone !== undefined ? Number(req.body.phone) : undefined,
        req.body.profileImage,
        req.body.dob == 'N/A' ? null : new Date(req.body.dob),
      );

      const userResponse = await this.updateUserDetailsUseCase.execute(userId, updateData);

      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, { userResponse });
    } catch (error) {
      next(error)
    }
  }

  async findUserWallet(req: Request, res: Response, next:NextFunction): Promise<void> {
    const userId = req.decoded?.userId;
    if (!userId) {
      sendResponse(res, HttpResCode.UNAUTHORIZED, ERROR_MESSAGES.AUTHENTICATION.UNAUTHORIZED);
      return;
    }

    try {
      const wallet = await this.findUserWalletUseCase.execute(userId);
      if (!wallet) {
        sendResponse(res, HttpResCode.NOT_FOUND, ERROR_MESSAGES.GENERAL.WALLET_NOT_FOUND);
        return;
      }
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, { wallet });
    } catch (error) {
      next(error)
    }
  }

  async findProfileContents(req: Request, res: Response, next:NextFunction): Promise<void> {
    const userId = req.decoded?.userId;
    if (!userId) {
      sendResponse(res, HttpResCode.UNAUTHORIZED, ERROR_MESSAGES.AUTHENTICATION.UNAUTHORIZED);
      return;
    }
    try {
      let walletBalance = await this.walletRepository.walletbalance(userId);

      if (!walletBalance) {
        walletBalance = 0;
      }
      const bookingsCount = await this.bookingRepository.countBookings(userId);

      const moviePass = await this.moviePassRepository.findByUserId(userId);
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, {
        walletBalance,
        bookingsCount,
        moviePass,
      });
    } catch (error) {
      next(error)
    }
  }

  async changePassword(req: Request, res: Response, next:NextFunction): Promise<void> {
    const userId = req.decoded?.userId;
    if (!userId) {
      sendResponse(res, HttpResCode.UNAUTHORIZED, ERROR_MESSAGES.AUTHENTICATION.UNAUTHORIZED);
      return;
    }

    try {
      const dto = new ChangePasswordRequestDTO(userId, req.body.oldPassword, req.body.newPassword);

      const userResponse = await this.changePasswordUseCase.execute(dto);

      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, { userResponse });
    } catch (error) {
      next(error)
    }
  }

  async findUserWalletTransactions(req: Request, res: Response, next:NextFunction): Promise<void> {
    const userId = req.decoded?.userId;
    if (!userId) {
      sendResponse(res, HttpResCode.UNAUTHORIZED, ERROR_MESSAGES.AUTHENTICATION.UNAUTHORIZED);
      return;
    }

    const { page = '1', limit = '5', filter = 'all' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const validFilters = ['all', 'credit', 'debit'];
    const filterValue = validFilters.includes(filter as string)
      ? (filter as 'all' | 'credit' | 'debit')
      : 'all';

    if (isNaN(pageNum) || pageNum < 1 || isNaN(limitNum) || limitNum < 1) {
      sendResponse(
        res,
        HttpResCode.BAD_REQUEST,
        ERROR_MESSAGES.VALIDATION.INVALID_PAGINATION_PARAMS,
      );
      return;
    }

    try {
      const result = await this.findWalletTransaction.execute(
        userId,
        pageNum,
        limitNum,
        filterValue,
      );
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, result);
    } catch (error) {
      next(error)
    }
  }

  async redeemLoyaltyPoints(req: Request, res: Response, next:NextFunction): Promise<void> {
    const userId = req.decoded?.userId;
    if (!userId) {
      sendResponse(res, HttpResCode.UNAUTHORIZED, ERROR_MESSAGES.AUTHENTICATION.UNAUTHORIZED);
      return;
    }

    try {
      const { amount } = req.body;

      // Validate amount
      if (!amount || isNaN(amount) || amount <= 0) {
        sendResponse(res, HttpResCode.BAD_REQUEST, ERROR_MESSAGES.VALIDATION.INVALID_INPUT);
        return;
      }

      const walletResponse = await this.redeemLoyalityToWalletUseCase.execute(userId, amount);

      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, { walletResponse });
    } catch (error) {
      next(error)
    }
  }

  async sendOtpPhone(req: Request, res: Response, next: NextFunction): Promise<void> {
    const userId = req.decoded?.userId;
    if (!userId) {
      sendResponse(res, HttpResCode.UNAUTHORIZED, ERROR_MESSAGES.AUTHENTICATION.UNAUTHORIZED);
      return;
    }

    try {
      const {phone} = req.body;
      const dto = new SendOtpPhoneRequestDTO(phone, userId);
      if (!phone || !/^\d{10}$/.test(phone)) {
        sendResponse(res, HttpResCode.BAD_REQUEST, ERROR_MESSAGES.VALIDATION.INVALID_PHONE);
        return;
      }

      await this.sendOtpPhoneUseCase.execute(dto);
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, { message: 'OTP sent successfully' });
    } catch (error) {
      next(error);
    }
  }

  async verifyOtpPhone(req: Request, res: Response, next: NextFunction): Promise<void> {
    const userId = req.decoded?.userId;
    if (!userId) {
      sendResponse(res, HttpResCode.UNAUTHORIZED, ERROR_MESSAGES.AUTHENTICATION.UNAUTHORIZED);
      return;
    }

    try {
      const {phone, otp} = req.body;
      const dto = new VerifyOtpPhoneRequestDTO(phone,otp,userId);
      if (!phone || !otp) {
        sendResponse(res, HttpResCode.BAD_REQUEST, ERROR_MESSAGES.VALIDATION.INVALID_INPUT);
        return;
      }

      await this.verifyOtpPhoneUseCase.execute(dto);
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, { message: 'OTP verified successfully' });
    } catch (error) {
      next(error);
    }
  }
}
