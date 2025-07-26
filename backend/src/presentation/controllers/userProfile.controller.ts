// src/presentation/controllers/userProfile.controller.ts
import 'reflect-metadata';
import { NextFunction, Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { container } from 'tsyringe';
import { sendResponse } from '../../utils/response/sendResponse.utils';
import { HttpResCode, HttpResMsg } from '../../utils/constants/httpResponseCode.utils';
import ERROR_MESSAGES from '../../utils/constants/commonErrorMsg.constants';
import { IgetUserDetailsUseCase } from '../../domain/interfaces/useCases/User/getUserDetails.interface';
import { IupdateUserProfileUseCase } from '../../domain/interfaces/useCases/User/updateUserProfile.interface';
import { ChangePasswordRequestDTO, UpdateProfileRequestDTO } from '../../application/dtos/user.dto';
import { IUserProfileController } from './interface/userProfile.controller.interface';
import { IFindUserWalletUseCase } from '../../domain/interfaces/useCases/User/findUserWallet.interface';
import { IChangePasswordUseCase } from '../../domain/interfaces/useCases/User/changePassword.interface';
import { IFindUserWalletTransactionsUseCase } from '../../domain/interfaces/useCases/User/findUserTransaction.interface';
import { IRedeemLoyalityToWalletUseCase } from '../../domain/interfaces/useCases/User/redeemLoyalityToWallet.interface';
import {
  SendOtpPhoneRequestDTO,
  VerifyOtpPhoneRequestDTO,
} from '../../application/dtos/profile.dto';
import { ISendOtpPhoneUseCase } from '../../domain/interfaces/useCases/User/sendOtpPhone.interface';
import { IVerifyOtpPhoneUseCase } from '../../domain/interfaces/useCases/User/verifyOtpPhone.interface';
import { IFindProfileContentsUseCase } from '../../domain/interfaces/useCases/User/findProfileContents.interface';
import { CustomError } from '../../utils/errors/custom.error';
import { IWithdrawFundsUseCase } from '../../domain/interfaces/useCases/Vendor/withdrawFunds.interface';

/**
 * Controller for managing user profile-related operations, including fetching profile details,
 * updating profile, managing wallet, changing password, and handling phone OTP for updates.
 * @implements {IUserProfileController}
 */
@injectable()
export class UserProfileController implements IUserProfileController {
  /**
   * Constructs an instance of UserProfileController.
   * @param {IgetUserDetailsUseCase} getUserDetailsUseCase - Use case for fetching authenticated user details.
   * @param {IupdateUserProfileUseCase} updateUserDetailsUseCase - Use case for updating user profile information.
   * @param {IFindUserWalletUseCase} findUserWalletUseCase - Use case for finding a user's wallet.
   * @param {IChangePasswordUseCase} changePasswordUseCase - Use case for changing a user's password.
   * @param {IFindUserWalletTransactionsUseCase} findWalletTransaction - Use case for finding user wallet transactions.
   * @param {IRedeemLoyalityToWalletUseCase} redeemLoyalityToWalletUseCase - Use case for redeeming loyalty points to wallet.
   * @param {ISendOtpPhoneUseCase} sendOtpPhoneUseCase - Use case for sending OTP to a phone number.
   * @param {IVerifyOtpPhoneUseCase} verifyOtpPhoneUseCase - Use case for verifying phone OTP.
   * @param {IFindProfileContentsUseCase} findProfileContentsUseCase - Use case for finding profile contents.
   * @param {IWithdrawFundsUseCase} withdrawFundsUseCase - Use case for withdrawing funds from wallet.
   */
  constructor(
    @inject('GetUserDetailsUseCase') private getUserDetailsUseCase: IgetUserDetailsUseCase,
    @inject('UpdateUserProfileUseCase') private updateUserDetailsUseCase: IupdateUserProfileUseCase,
    @inject('FindUserWalletUseCase') private findUserWalletUseCase: IFindUserWalletUseCase,
    @inject('ChangePasswordUseCase') private changePasswordUseCase: IChangePasswordUseCase,
    @inject('WalletTransactionUseCase')
    private findWalletTransaction: IFindUserWalletTransactionsUseCase,
    @inject('RedeemLoyalityToWalletUseCase')
    private redeemLoyalityToWalletUseCase: IRedeemLoyalityToWalletUseCase,
    @inject('SendOtpPhoneUseCase') private sendOtpPhoneUseCase: ISendOtpPhoneUseCase,
    @inject('VerifyOtpPhoneUseCase') private verifyOtpPhoneUseCase: IVerifyOtpPhoneUseCase,
    @inject('FindProfileContentsUseCase')
    private findProfileContentsUseCase: IFindProfileContentsUseCase,
    @inject('WithdrawFundsUseCase') private withdrawFundsUseCase: IWithdrawFundsUseCase,
  ) {}

  /**
   * Retrieves the details of the currently authenticated user.
   * @param {Request} req - The Express request object. Requires `req.decoded.userId`.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   * @returns {Promise<void>}
   */
  async getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
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
      next(error);
    }
  }

  /**
   * Updates the profile information of the currently authenticated user.
   * @param {Request} req - The Express request object. Requires `req.decoded.userId` and update data in `req.body`.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   * @returns {Promise<void>}
   */
  async updateUserProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    const userId = req.decoded?.userId;
    if (!userId) {
      sendResponse(res, HttpResCode.UNAUTHORIZED, ERROR_MESSAGES.AUTHENTICATION.UNAUTHORIZED);
      return;
    }

    try {
      const updateData = new UpdateProfileRequestDTO(
        req.body.name,
        req.body.phone !== undefined && req.body.phone !== 'N/A' && !isNaN(Number(req.body.phone))
          ? Number(req.body.phone)
          : null,
        req.body.profileImage,
        req.body.dob == 'N/A' ? null : new Date(req.body.dob),
      );

      const userResponse = await this.updateUserDetailsUseCase.execute(userId, updateData);

      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, { userResponse });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieves the wallet details for the currently authenticated user.
   * @param {Request} req - The Express request object. Requires `req.decoded.userId`.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   * @returns {Promise<void>}
   */
  async findUserWallet(req: Request, res: Response, next: NextFunction): Promise<void> {
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
      next(error);
    }
  }

  /**
   * Fetches summary information for the user's profile dashboard, including wallet balance,
   * booking count, and movie pass status.
   * @param {Request} req - The Express request object. Requires `req.decoded.userId`.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   * @returns {Promise<void>}
   */
  async findProfileContents(req: Request, res: Response, next: NextFunction): Promise<void> {
    const userId = req.decoded?.userId;
    if (!userId) {
      sendResponse(res, HttpResCode.UNAUTHORIZED, ERROR_MESSAGES.AUTHENTICATION.UNAUTHORIZED);
      return;
    }
    try {
      const response = await this.findProfileContentsUseCase.execute(userId);
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Allows the authenticated user to change their password.
   * @param {Request} req - The Express request object. Requires `req.decoded.userId` and `oldPassword`, `newPassword` in `req.body`.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   * @returns {Promise<void>}
   */
  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
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
      next(error);
    }
  }

  /**
   * Retrieves paginated and filtered wallet transactions for the authenticated user.
   * @param {Request} req - The Express request object. Requires `req.decoded.userId` and optional query parameters for `page`, `limit`, and `filter`.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   * @returns {Promise<void>}
   */
  async findUserWalletTransactions(req: Request, res: Response, next: NextFunction): Promise<void> {
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
      next(error);
    }
  }

  /**
   * Redeems a specified amount of loyalty points for wallet balance for the authenticated user.
   * @param {Request} req - The Express request object. Requires `req.decoded.userId` and `amount` in `req.body`.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   * @returns {Promise<void>}
   */
  async redeemLoyaltyPoints(req: Request, res: Response, next: NextFunction): Promise<void> {
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
      next(error);
    }
  }

  /**
   * Sends an OTP to the user's provided phone number for verification (e.g., for updating phone number).
   * @param {Request} req - The Express request object. Requires `req.decoded.userId` and `phone` in `req.body`.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   * @returns {Promise<void>}
   */
  async sendOtpPhone(req: Request, res: Response, next: NextFunction): Promise<void> {
    const userId = req.decoded?.userId;
    if (!userId) {
      sendResponse(res, HttpResCode.UNAUTHORIZED, ERROR_MESSAGES.AUTHENTICATION.UNAUTHORIZED);
      return;
    }

    try {
      const { phone } = req.body;
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

  /**
   * Verifies the OTP provided for phone number verification.
   * @param {Request} req - The Express request object. Requires `req.decoded.userId`, `phone`, and `otp` in `req.body`.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   * @returns {Promise<void>}
   */
  async verifyOtpPhone(req: Request, res: Response, next: NextFunction): Promise<void> {
    const userId = req.decoded?.userId;
    if (!userId) {
      sendResponse(res, HttpResCode.UNAUTHORIZED, ERROR_MESSAGES.AUTHENTICATION.UNAUTHORIZED);
      return;
    }

    try {
      const { phone, otp } = req.body;
      const dto = new VerifyOtpPhoneRequestDTO(phone, otp, userId);
      if (!phone || !otp) {
        sendResponse(res, HttpResCode.BAD_REQUEST, ERROR_MESSAGES.VALIDATION.INVALID_INPUT);
        return;
      }

      await this.verifyOtpPhoneUseCase.execute(dto);
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, {
        message: 'OTP verified successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Withdraws a specified amount from the user's wallet to their Stripe account.
   * @param {Request} req - The Express request object. Requires `req.decoded.userId`, `amount`, and `stripeAccountId` in `req.body`.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   * @returns {Promise<void>}
   */
  async withdrawFromWallet(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.decoded?.userId;
      const { amount, stripeAccountId } = req.body;

      if (!userId || typeof amount !== 'number' || amount <= 0 || !stripeAccountId) {
        throw new CustomError(ERROR_MESSAGES.VALIDATION.INVALID_INPUT, HttpResCode.BAD_REQUEST);
      }

      const result = await this.withdrawFundsUseCase.execute(userId, amount, stripeAccountId);

      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, result);
    } catch (error) {
      next(error);
    }
  }
}
