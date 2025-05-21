// src/presentation/controllers/auth.controller.ts
import 'reflect-metadata';
import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { container } from 'tsyringe';

import { sendResponse } from '../../utils/response/sendResponse.utils';
import { HttpResCode, HttpResMsg } from '../../utils/constants/httpResponseCode.utils';
import ERROR_MESSAGES from '../../utils/constants/commonErrorMsg.constants';
import { CustomError } from '../../utils/errors/custom.error';

import { VerifyOtpDTO, LoginDTO, ForgotPassVerifyOtpDTO, ForgotPassSendOtpDTO, ForgotPassUpdateDTO } from '../../application/dtos/auth.dto';

import { IUserAuthController } from './interface/userAuth.controller.interface';

import { ISendOtpUseCase } from '../../domain/interfaces/useCases/User/sentOtpUser.interface';
import { IVerifyOtpUseCase } from '../../domain/interfaces/useCases/User/verifyOtpUser.interface';
import { IGoogleAuthUseCase } from '../../domain/interfaces/useCases/User/googleAuthUser.interface';
import { ILoginUserUseCase } from '../../domain/interfaces/useCases/User/loginUser.interface';

import { IAuthRepository } from '../../domain/interfaces/repositories/userAuth.types';
import { JwtService } from '../../infrastructure/services/jwt.service';
import { IForgotPasswordSendOtpUseCase } from '../../domain/interfaces/useCases/Admin/forgotPasswordSendOtp.interface';
import { IForgotPasswordUpdateUseCase } from '../../domain/interfaces/useCases/Admin/forgotPasswordUpdate.interface';
import { IForgotPasswordVerifyOtpUseCase } from '../../domain/interfaces/useCases/Admin/forgotPasswordVerifyOtp.interface';
import jwt from 'jsonwebtoken';
import { IUserRepository } from '../../domain/interfaces/repositories/user.repository';
import { IgetUserDetailsUseCase } from '../../domain/interfaces/useCases/User/getUserDetails.interface';
@injectable()
export class UserAuthController implements IUserAuthController {
  constructor(
    @inject('SendOtpUserUseCase') private sendOtpUseCase: ISendOtpUseCase,
    @inject('VerifyOtpUserUseCase') private verifyOtpUseCase: IVerifyOtpUseCase,
    @inject('GoogleAuthUseCase') private googleAuthUseCase: IGoogleAuthUseCase,
    @inject('LoginUserUseCase') private loginUserUseCase: ILoginUserUseCase,
    @inject('ForgotPassSendOtp') private forgotPassSendOtpUseCase: IForgotPasswordSendOtpUseCase,
    @inject('ForgotPassUpdate') private forgotPassUpdatePassUseCase: IForgotPasswordUpdateUseCase,
    @inject('ForgotPassVerifyOtp') private forgotPassVerifyOtpUseCase: IForgotPasswordVerifyOtpUseCase,
    @inject('GetUserDetailsUseCase') private getUserDetailsUseCase: IgetUserDetailsUseCase,
    @inject('IUserRepository') private userRepository: IUserRepository,
  ) {}

  async googleCallback(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.googleAuthUseCase.execute(req.body);
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000,
      });
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, {
        accessToken: result.accessToken,
        user: result.user,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : ERROR_MESSAGES.AUTHENTICATION.GOOGLE_AUTH_FAILED;
      console.error('googleCallback error:', errorMessage);
      sendResponse(res, HttpResCode.BAD_REQUEST, errorMessage);
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      console.log('AuthController.refreshToken: Checking cookies');
      
      if (!req.cookies.refreshToken) {
        console.log('AuthController.refreshToken: No refresh token found');
        sendResponse(res, HttpResCode.UNAUTHORIZED, ERROR_MESSAGES.AUTHENTICATION.INVALID_REFRESH_TOKEN);
        return;
      }
      
      const refreshToken = req.cookies.refreshToken;
      console.log('AuthController.refreshToken: Received refresh token');

      // Decode first to check expiration
      const decoded = jwt.decode(refreshToken) as jwt.JwtPayload;
      
      if (!decoded || !decoded.exp || Date.now() >= decoded.exp * 1000) {
        console.log('AuthController.refreshToken: Refresh token expired');
        sendResponse(res, HttpResCode.UNAUTHORIZED, ERROR_MESSAGES.AUTHENTICATION.INVALID_REFRESH_TOKEN);
        return;
      }

      // Verify token
      const jwtService = container.resolve<JwtService>('JwtService');
      const verifiedDecoded = jwtService.verifyRefreshToken(refreshToken);
      
      // const authRepository = container.resolve<IAuthRepository>('AuthRepository');
      const user = await this.userRepository.findById(verifiedDecoded.userId);

      if (!user) {
        console.log('AuthController.refreshToken: User not found');
        sendResponse(res, HttpResCode.NOT_FOUND, ERROR_MESSAGES.AUTHENTICATION.USER_NOT_FOUND);
        return;
      }

      // Generate new access token
      const newAccessToken = jwtService.generateAccessToken(user._id.toString(), user.role);
      console.log('AuthController.refreshToken: New access token generated');

      // Send new token response
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, { accessToken: newAccessToken });

    } catch (error) {
      console.error('AuthController.refreshToken error:', error || ERROR_MESSAGES.AUTHENTICATION.INVALID_REFRESH_TOKEN);
      sendResponse(res, HttpResCode.UNAUTHORIZED, ERROR_MESSAGES.AUTHENTICATION.INVALID_REFRESH_TOKEN);
    }
  }


  async getCurrentUser(req: Request, res: Response): Promise<void> {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      sendResponse(res, HttpResCode.UNAUTHORIZED, ERROR_MESSAGES.AUTHENTICATION.UNAUTHORIZED);
      return;
    }
    try {
      const jwtService = container.resolve<JwtService>('JwtService');
      const decoded = jwtService.verifyAccessToken(token);
      const user = await this.getUserDetailsUseCase.execute(decoded.userId);
      if (!user) {
        sendResponse(res, HttpResCode.NOT_FOUND, ERROR_MESSAGES.AUTHENTICATION.USER_NOT_FOUND);
        return;
      }
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, {
        id: user._id?.toString() || '',
        name: user.name,
        email: user.email,
        phone: user.phone? user.phone : 'N/A',
        profileImage: user.profileImage,
        role: user.role,
        loyaltyPoints: user.loyalityPoints || 0,
        dateOfBirth: user.dob ? user.dob : 'N/A',
        joinedDate: user.createdAt.toDateString(),
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : ERROR_MESSAGES.AUTHENTICATION.INVALID_ACCESS_TOKEN;
      console.error('getCurrentUser error:', errorMessage);
      sendResponse(res, HttpResCode.BAD_REQUEST, errorMessage);
    }
  }

  async sendOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email || typeof email !== 'string' || !email.trim()) {
        sendResponse(res, HttpResCode.BAD_REQUEST, 'Email is required.');
        return;
      }
      await this.sendOtpUseCase.execute(email.trim());

      console.log('AuthController.sendOtp: OTP process completed.');
      sendResponse(res, HttpResCode.OK, 'OTP sent successfully.');
    } catch (error) {
      const errorMessage = error instanceof CustomError ? error.message : 'Failed to send OTP.';
      console.error('AuthController.sendOtp error:', { errorMessage, email: req.body.email });
      sendResponse(res, HttpResCode.BAD_REQUEST, errorMessage);
    }
  }

  async verifyOtp(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, otp } = req.body;
      console.log('AuthController.verifyOtp: Received request:', { email, otp });

      const dto = new VerifyOtpDTO(name, email, otp, password);
      const result = await this.verifyOtpUseCase.execute(dto);
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000,
      });
      sendResponse(res, HttpResCode.OK, 'Register successful.', {
        accessToken: result.accessToken,
        user: result.user,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to verify OTP.';
      console.error('AuthController.verifyOtp error:', errorMessage);
      sendResponse(res, HttpResCode.BAD_REQUEST, errorMessage);
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      const dto = new LoginDTO(email, password);
      const response = await this.loginUserUseCase.execute(dto);

      res.cookie('refreshToken', response.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      sendResponse(res, HttpResCode.OK, 'Login successful.', {
        accessToken: response.accessToken,
        user: response.user,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to verify OTP.';
      console.error('AuthController.verifyOtp error:', errorMessage);
      sendResponse(res, HttpResCode.BAD_REQUEST, errorMessage);
    }
  }

  
  async logout(req: Request, res: Response): Promise<void> {
    try {      
      res.clearCookie("refreshToken", {
        httpOnly: true,
        sameSite: "strict",
      });

      sendResponse(res, HttpResCode.OK, 'Successfully logged out');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to logout.';
      console.error("Logout failed:", error);
      sendResponse(res, HttpResCode.BAD_REQUEST, errorMessage);
    }
  }

  async forgotPassSendOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body as ForgotPassSendOtpDTO;
      console.log('AuthController.requestPasswordReset: Received request:', { email });

      await this.forgotPassSendOtpUseCase.execute(email.trim());
      console.log('AuthController.requestPasswordReset: OTP process completed');
      sendResponse(res, HttpResCode.OK, 'OTP sent successfully');
    } catch (error) {
      const errorMessage =
        error instanceof CustomError ? error.message : ERROR_MESSAGES.GENERAL.FAILED_SENDING_OTP;
      console.error('AuthController.requestPasswordReset error:', { errorMessage, email: req.body.email });
      sendResponse(res, HttpResCode.BAD_REQUEST, errorMessage);
    }
  }

  async forgotPassVerifyOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp } = req.body as  ForgotPassVerifyOtpDTO;
      console.log('AuthController.verifyOtp: Received request:', { email, otp });

      await this.forgotPassVerifyOtpUseCase.execute(email, otp);
      console.log('AuthController.verifyOtp: OTP verified successfully');
      sendResponse(res, HttpResCode.OK, 'OTP verified successfully');
    } catch (error) {
      const errorMessage =
        error instanceof CustomError ? error.message : ERROR_MESSAGES.VALIDATION.INVALID_OTP;
      console.error('AuthController.verifyOtp error:', errorMessage);
      sendResponse(res,HttpResCode.BAD_REQUEST, errorMessage);
    }
  }

  async forgotPassUpdatePassword(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body as ForgotPassUpdateDTO;
      console.log('AuthController.updatePassword: Received request:', { email });

      await this.forgotPassUpdatePassUseCase.execute(email, password);
      console.log('AuthController.updatePassword: Password updated successfully');
      sendResponse(res, HttpResCode.OK, 'Password updated successfully');
    } catch (error) {
      const errorMessage =
        error instanceof CustomError ? error.message : ERROR_MESSAGES.GENERAL.FAILED_TO_UPDATE_PASSWORD;
      console.error('AuthController.updatePassword error:', errorMessage);
      sendResponse(res,HttpResCode.BAD_REQUEST, errorMessage);
    }
  }
}