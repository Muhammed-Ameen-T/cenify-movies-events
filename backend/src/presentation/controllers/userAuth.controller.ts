// src/presentation/controllers/auth.controller.ts
import 'reflect-metadata';
import { NextFunction, Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { container } from 'tsyringe';

import { sendResponse } from '../../utils/response/sendResponse.utils';
import { HttpResCode, HttpResMsg } from '../../utils/constants/httpResponseCode.utils';
import ERROR_MESSAGES from '../../utils/constants/commonErrorMsg.constants';
import { CustomError } from '../../utils/errors/custom.error';

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

import { IAuthRepository } from '../../domain/interfaces/repositories/userAuth.types';
import { JwtService } from '../../infrastructure/services/jwt.service';
import { IForgotPasswordSendOtpUseCase } from '../../domain/interfaces/useCases/Admin/forgotPasswordSendOtp.interface';
import { IForgotPasswordUpdateUseCase } from '../../domain/interfaces/useCases/Admin/forgotPasswordUpdate.interface';
import { IForgotPasswordVerifyOtpUseCase } from '../../domain/interfaces/useCases/Admin/forgotPasswordVerifyOtp.interface';
import jwt from 'jsonwebtoken';
import { IUserRepository } from '../../domain/interfaces/repositories/user.repository';
import { IgetUserDetailsUseCase } from '../../domain/interfaces/useCases/User/getUserDetails.interface';
import { SuccessMsg } from '../../utils/constants/commonSuccessMsg.constants';
@injectable()
export class UserAuthController implements IUserAuthController {
  constructor(
    @inject('SendOtpUserUseCase') private sendOtpUseCase: ISendOtpUseCase,
    @inject('VerifyOtpUserUseCase') private verifyOtpUseCase: IVerifyOtpUseCase,
    @inject('GoogleAuthUseCase') private googleAuthUseCase: IGoogleAuthUseCase,
    @inject('LoginUserUseCase') private loginUserUseCase: ILoginUserUseCase,
    @inject('ForgotPassSendOtp') private forgotPassSendOtpUseCase: IForgotPasswordSendOtpUseCase,
    @inject('ForgotPassUpdate') private forgotPassUpdatePassUseCase: IForgotPasswordUpdateUseCase,
    @inject('ForgotPassVerifyOtp')
    private forgotPassVerifyOtpUseCase: IForgotPasswordVerifyOtpUseCase,
    @inject('GetUserDetailsUseCase') private getUserDetailsUseCase: IgetUserDetailsUseCase,
    @inject('IUserRepository') private userRepository: IUserRepository,
  ) {}

  async googleCallback(req: Request, res: Response, next:NextFunction): Promise<void> {
    try {
      const result = await this.googleAuthUseCase.execute(req.body);
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, {
        accessToken: result.accessToken,
        user: result.user,
      });
    } catch (error) {
     next(error)
    }
  }

  async refreshToken(req: Request, res: Response, next:NextFunction): Promise<void> {
    try {

      if (!req.cookies.refreshToken) {
        sendResponse(
          res,
          HttpResCode.UNAUTHORIZED,
          ERROR_MESSAGES.AUTHENTICATION.INVALID_REFRESH_TOKEN,
        );
        return;
      }

      const refreshToken = req.cookies.refreshToken;

      // Decode first to check expiration
      const decoded = jwt.decode(refreshToken) as jwt.JwtPayload;

      if (!decoded || !decoded.exp || Date.now() >= decoded.exp * 1000) {
        sendResponse(
          res,
          HttpResCode.UNAUTHORIZED,
          ERROR_MESSAGES.AUTHENTICATION.INVALID_REFRESH_TOKEN,
        );
        return;
      }

      // Verify token
      const jwtService = container.resolve<JwtService>('JwtService');
      const verifiedDecoded = jwtService.verifyRefreshToken(refreshToken);

      // const authRepository = container.resolve<IAuthRepository>('AuthRepository');
      const user = await this.userRepository.findById(verifiedDecoded.userId);

      if (!user) {
        sendResponse(res, HttpResCode.NOT_FOUND, ERROR_MESSAGES.AUTHENTICATION.USER_NOT_FOUND);
        return;
      }

      // Generate new access token
      const newAccessToken = jwtService.generateAccessToken(user._id.toString(), user.role);

      // Send new token response
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, { accessToken: newAccessToken });
    } catch (error) {
      next(error)
    }
  }

  async getCurrentUser(req: Request, res: Response, next:NextFunction): Promise<void> {
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

  async sendOtp(req: Request, res: Response, next:NextFunction): Promise<void> {
    try {
      const { email } = req.body;

      if (!email || typeof email !== 'string' || !email.trim()) {
        sendResponse(res, HttpResCode.BAD_REQUEST, ERROR_MESSAGES.VALIDATION.EMAIL_FORMAT_INVALID);
        return;
      }
      await this.sendOtpUseCase.execute(email.trim());

      sendResponse(res, HttpResCode.OK, SuccessMsg.OTP_SENT);
    } catch (error) {
      next(error)
    }
  }

  async verifyOtp(req: Request, res: Response, next:NextFunction): Promise<void> {
    try {
      const { name, email, password, otp } = req.body;

      const dto = new VerifyOtpDTO(name, email, otp, password);
      const result = await this.verifyOtpUseCase.execute(dto);
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      sendResponse(res, HttpResCode.OK, SuccessMsg.USER_REGISTERED, {
        accessToken: result.accessToken,
        user: result.user,
      });
    } catch (error) {
      next(error)
    }
  }

  async login(req: Request, res: Response, next:NextFunction): Promise<void> {
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

      sendResponse(res, HttpResCode.OK, SuccessMsg.USER_LOGGED_IN, {
        accessToken: response.accessToken,
        user: response.user,
      });
    } catch (error) {
      console.log("🚀 ~ UserAuthController ~ login ~ error:", error)
      next(error)
    }
  }

  async logout(req: Request, res: Response, next:NextFunction): Promise<void> {
    try {
      res.clearCookie('refreshToken');
      sendResponse(res, HttpResCode.OK, SuccessMsg.USER_LOGGED_OUT);
    } catch (error) {
      next(error)
    }
  }

  async forgotPassSendOtp(req: Request, res: Response, next:NextFunction): Promise<void> {
    try {
      const { email } = req.body as ForgotPassSendOtpDTO;

      await this.forgotPassSendOtpUseCase.execute(email.trim());
      sendResponse(res, HttpResCode.OK, SuccessMsg.OTP_SENT);
    } catch (error) {
      next(error)
    }
  }

  async forgotPassVerifyOtp(req: Request, res: Response, next:NextFunction): Promise<void> {
    try {
      const { email, otp } = req.body as ForgotPassVerifyOtpDTO;

      await this.forgotPassVerifyOtpUseCase.execute(email, otp);
      sendResponse(res, HttpResCode.OK, SuccessMsg.OTP_VERIFIED);
    } catch (error) {
      next(error)
    }
  }

  async forgotPassUpdatePassword(req: Request, res: Response, next:NextFunction): Promise<void> {
    try {
      const { email, password } = req.body as ForgotPassUpdateDTO;

      await this.forgotPassUpdatePassUseCase.execute(email, password);
      sendResponse(res, HttpResCode.OK, SuccessMsg.PASSWORD_UPDATED);
    } catch (error) {
      next(error)
    }
  }
}
