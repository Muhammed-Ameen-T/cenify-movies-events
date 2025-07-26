// src/presentation/controllers/userAuth.controller.ts
import 'reflect-metadata';
import { NextFunction, Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { sendResponse } from '../../utils/response/sendResponse.utils';
import { HttpResCode, HttpResMsg } from '../../utils/constants/httpResponseCode.utils';
import ERROR_MESSAGES from '../../utils/constants/commonErrorMsg.constants';
import {
  VerifyOtpDTO,
  LoginDTO,
  ForgotPassVerifyOtpDTO,
  ForgotPassSendOtpDTO,
  ForgotPassUpdateDTO,
} from '../../application/dtos/auth.dto';
import { IUserAuthController } from './interface/userAuth.controller.interface';
import { ISendOtpUseCase } from '../../domain/interfaces/useCases/User/sentOtpUser.interface';
import { IVerifyOtpUseCase } from '../../domain/interfaces/useCases/User/verifyOtpUser.interface';
import { IGoogleAuthUseCase } from '../../domain/interfaces/useCases/User/googleAuthUser.interface';
import { ILoginUserUseCase } from '../../domain/interfaces/useCases/User/loginUser.interface';
import { IForgotPasswordSendOtpUseCase } from '../../domain/interfaces/useCases/Admin/forgotPasswordSendOtp.interface';
import { IForgotPasswordUpdateUseCase } from '../../domain/interfaces/useCases/Admin/forgotPasswordUpdate.interface';
import { IForgotPasswordVerifyOtpUseCase } from '../../domain/interfaces/useCases/Admin/forgotPasswordVerifyOtp.interface';
import { SuccessMsg } from '../../utils/constants/commonSuccessMsg.constants';
import { IRefreshTokenUseCase } from '../../domain/interfaces/useCases/User/refreshToken.interface';
/**
 * Controller for handling user authentication, including OTP-based registration, login,
 * Google authentication, token refreshing, and password reset functionalities.
 * @implements {IUserAuthController}
 */
@injectable()
export class UserAuthController implements IUserAuthController {
  /**
   * Constructs an instance of UserAuthController.
   * @param {ISendOtpUseCase} sendOtpUseCase - Use case for sending OTP to a user's email.
   * @param {IVerifyOtpUseCase} verifyOtpUseCase - Use case for verifying OTP and registering/logging in a user.
   * @param {IGoogleAuthUseCase} googleAuthUseCase - Use case for handling Google OAuth authentication.
   * @param {ILoginUserUseCase} loginUserUseCase - Use case for user login.
   * @param {IForgotPasswordSendOtpUseCase} forgotPassSendOtpUseCase - Use case for sending OTP for password reset.
   * @param {IForgotPasswordUpdateUseCase} forgotPassUpdatePassUseCase - Use case for updating password after OTP verification.
   * @param {IForgotPasswordVerifyOtpUseCase} forgotPassVerifyOtpUseCase - Use case for verifying OTP during password reset.
   * @param {IRefreshTokenUseCase} refreshTokenUseCase - Use case for creaeting new Access Token Using refreshToken.
   */
  constructor(
    @inject('SendOtpUserUseCase') private sendOtpUseCase: ISendOtpUseCase,
    @inject('VerifyOtpUserUseCase') private verifyOtpUseCase: IVerifyOtpUseCase,
    @inject('GoogleAuthUseCase') private googleAuthUseCase: IGoogleAuthUseCase,
    @inject('LoginUserUseCase') private loginUserUseCase: ILoginUserUseCase,
    @inject('ForgotPassSendOtp') private forgotPassSendOtpUseCase: IForgotPasswordSendOtpUseCase,
    @inject('ForgotPassUpdate') private forgotPassUpdatePassUseCase: IForgotPasswordUpdateUseCase,
    @inject('ForgotPassVerifyOtp')
    private forgotPassVerifyOtpUseCase: IForgotPasswordVerifyOtpUseCase,
    @inject('RefreshTokenUseCase') private refreshTokenUseCase: IRefreshTokenUseCase,
  ) {}

  /**
   * Handles the Google OAuth callback, processes user data, generates tokens, and sets a refresh token cookie.
   * @param {Request} req - The Express request object, containing Google authentication data in the body.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   * @returns {Promise<void>}
   */
  async googleCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.googleAuthUseCase.execute(req.body);
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: parseInt(process.env.MAX_AGE || '0', 10),
      });
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, {
        accessToken: result.accessToken,
        user: result.user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refreshes the access token using a provided refresh token from cookies.
   * @param {Request} req - The Express request object, expecting `refreshToken` in cookies.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   * @returns {Promise<void>}
   */
  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken;
      const newAccessToken = await this.refreshTokenUseCase.execute(refreshToken);
      // Send new token response
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, { accessToken: newAccessToken });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieves details of the currently authenticated user based on their access token.
   * @param {Request} req - The Express request object, expecting an Authorization header with a Bearer token.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   * @returns {Promise<void>}
   */
  // async getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  //   const token = req.headers.authorization?.split(' ')[1];
  //   if (!token) {
  //     sendResponse(res, HttpResCode.UNAUTHORIZED, ERROR_MESSAGES.AUTHENTICATION.UNAUTHORIZED);
  //     return;
  //   }
  //   try {
  //     const jwtService = container.resolve<JwtService>('JwtService');
  //     const decoded = jwtService.verifyAccessToken(token);
  //     const user = await this.getUserDetailsUseCase.execute(decoded.userId);
  //     if (!user) {
  //       sendResponse(res, HttpResCode.NOT_FOUND, ERROR_MESSAGES.AUTHENTICATION.USER_NOT_FOUND);
  //       return;
  //     }
  //     sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, {
  //       id: user._id?.toString() || '',
  //       name: user.name,
  //       email: user.email,
  //       phone: user.phone ? user.phone : 'N/A',
  //       profileImage: user.profileImage,
  //       role: user.role,
  //       loyalityPoints: user.loyalityPoints || 0,
  //       dateOfBirth: user.dob ? user.dob : 'N/A',
  //       joinedDate: user.createdAt.toDateString(),
  //     });
  //   } catch (error) {
  //     next(error);
  //   }
  // }

  /**
   * Sends an OTP to the provided email address for user registration or verification.
   * @param {Request} req - The Express request object, containing `email` in the body.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   * @returns {Promise<void>}
   */
  async sendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;

      if (!email || typeof email !== 'string' || !email.trim()) {
        sendResponse(res, HttpResCode.BAD_REQUEST, ERROR_MESSAGES.VALIDATION.EMAIL_FORMAT_INVALID);
        return;
      }
      await this.sendOtpUseCase.execute(email.trim());

      sendResponse(res, HttpResCode.OK, SuccessMsg.OTP_SENT);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verifies the OTP and completes user registration or login, setting a refresh token cookie.
   * @param {Request} req - The Express request object, containing `name`, `email`, `password`, and `otp` in the body.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   * @returns {Promise<void>}
   */
  async verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password, otp } = req.body;

      const dto = new VerifyOtpDTO(name, email, otp, password);
      const result = await this.verifyOtpUseCase.execute(dto);
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: parseInt(process.env.MAX_AGE || '0', 10),
      });
      sendResponse(res, HttpResCode.OK, SuccessMsg.USER_REGISTERED, {
        accessToken: result.accessToken,
        user: result.user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles user login, authenticates credentials, and sets a refresh token cookie.
   * @param {Request} req - The Express request object, containing `email` and `password` in the body.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   * @returns {Promise<void>}
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      const dto = new LoginDTO(email, password);
      const response = await this.loginUserUseCase.execute(dto);

      res.cookie('refreshToken', response.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: parseInt(process.env.MAX_AGE || '0', 10),
      });

      sendResponse(res, HttpResCode.OK, SuccessMsg.USER_LOGGED_IN, {
        accessToken: response.accessToken,
        user: response.user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logs out the user by clearing the refresh token cookie.
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   * @returns {Promise<void>}
   */
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.clearCookie('refreshToken');
      sendResponse(res, HttpResCode.OK, SuccessMsg.USER_LOGGED_OUT);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Sends an OTP to the user's email for a forgotten password reset process.
   * @param {Request} req - The Express request object, containing `email` in the body.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   * @returns {Promise<void>}
   */
  async forgotPassSendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body as ForgotPassSendOtpDTO;

      await this.forgotPassSendOtpUseCase.execute(email.trim());
      sendResponse(res, HttpResCode.OK, SuccessMsg.OTP_SENT);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verifies the OTP provided by the user for a forgotten password reset.
   * @param {Request} req - The Express request object, containing `email` and `otp` in the body.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   * @returns {Promise<void>}
   */
  async forgotPassVerifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, otp } = req.body as ForgotPassVerifyOtpDTO;

      await this.forgotPassVerifyOtpUseCase.execute(email, otp);
      sendResponse(res, HttpResCode.OK, SuccessMsg.OTP_VERIFIED);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Updates the user's password after successful OTP verification during the forgotten password process.
   * @param {Request} req - The Express request object, containing `email` and `password` in the body.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   * @returns {Promise<void>}
   */
  async forgotPassUpdatePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body as ForgotPassUpdateDTO;

      await this.forgotPassUpdatePassUseCase.execute(email, password);
      sendResponse(res, HttpResCode.OK, SuccessMsg.PASSWORD_UPDATED);
    } catch (error) {
      next(error);
    }
  }
}
