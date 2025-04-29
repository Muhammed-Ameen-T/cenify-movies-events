// src/presentation/controllers/theaterAuth.controller.ts
import 'reflect-metadata';
import { Request, Response } from 'express';
import { injectable, inject, container } from 'tsyringe';

import { sendResponse } from '../../utils/response/sendResponse.utils';
import { HttpResCode, HttpResMsg } from '../../utils/constants/httpResponseCode.utils';
import ERROR_MESSAGES from '../../utils/constants/commonErrorMsg.constants';
import { CustomError } from '../../utils/errors/custome.error';

import {
  SendOtpVendorDTO,
  VerifyOtpVendorDTO,
  LoginVendorDTO,
  TheaterDetailsDTO,
  UpdateTheaterDetailsDTO,
} from '../../application/dtos/vendor.dto';
import { IVendorAuthController } from './interface/theaterAuth.controller.interface';

import { ISendOtpVendorUseCase } from '../../domain/interfaces/useCases/Vendor/sendOtpVendor.interface';
import { IVerifyOtpVendorUseCase } from '../../domain/interfaces/useCases/Vendor/verifyOtpVendor.interface';
import { ILoginVendorUseCase } from '../../domain/interfaces/useCases/Vendor/loginVendor.interface';
import { IUpdateVendorDetailsUseCase } from '../../domain/interfaces/useCases/Vendor/updateVendorDetails.interface';

import { IVendorRepository } from '../../domain/interfaces/repositories/vendor.repository';
import { JwtService } from '../../infrastructure/services/jwt.service';
import { SuccessMsg } from '../../utils/constants/commonSuccessMsg.constants';

@injectable()
export class VendorAuthController implements IVendorAuthController {
  constructor(
    @inject('SendOtpVendorUseCase') private sendOtpUseCase: ISendOtpVendorUseCase,
    @inject('VerifyOtpVendorUseCase') private verifyOtpUseCase: IVerifyOtpVendorUseCase,
    @inject('LoginVendorUseCase') private loginVendorUseCase: ILoginVendorUseCase,
    @inject('UpdateVendorDetailsUseCase') private updateVendorDetailsUseCase: IUpdateVendorDetailsUseCase,
    @inject('VendorRepository') private vendorRepository: IVendorRepository,
  ) {}

  async sendOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      const dto = new SendOtpVendorDTO(email);
      dto.email = email.trim();
      await this.sendOtpUseCase.execute(dto);
      sendResponse(res, HttpResCode.OK, 'OTP sent successfully.');
    } catch (error) {
      const errorMessage =
        error instanceof CustomError ? error.message : ERROR_MESSAGES.GENERAL.FAILED_SENDING_OTP;
      sendResponse(res, HttpResCode.BAD_REQUEST, errorMessage);
    }
  }

  async verifyOtp(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password,phone, accountType, otp } = req.body;
      const dto = new VerifyOtpVendorDTO(name, email, password,phone, accountType, otp);
      const result = await this.verifyOtpUseCase.execute(dto);
      console.log("🚀 ~ VendorAuthController ~ verifyOtp ~ result:", result)
      
      sendResponse(res, HttpResCode.OK, SuccessMsg.USER_REGISTERED, {
        accessToken: result.accessToken,
        user: result.user,
      });
    } catch (error) {
      const errorMessage = error instanceof CustomError ? error.message : ERROR_MESSAGES.VALIDATION.INVALID_OTP;
      sendResponse(res, HttpResCode.BAD_REQUEST, errorMessage);
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const dto = new LoginVendorDTO(email, password);
      const result = await this.loginVendorUseCase.execute(dto);
      console.log("🚀 ~ VendorAuthController ~ login ~ result:", result.refreshToken)
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      sendResponse(res, HttpResCode.OK, SuccessMsg.USER_LOGGED_IN, {
        accessToken: result.accessToken,
        user: result.user,
      });
    } catch (error) {
      const errorMessage =
        error instanceof CustomError
          ? error.message
          : ERROR_MESSAGES.AUTHENTICATION.PERMISSION_DENIED;
      sendResponse(res, HttpResCode.UNAUTHORIZED, errorMessage);      
    }
  }

  async updateTheaterDetails(req: Request, res: Response): Promise<void> {
    try {
      const { id, location, facilities, intervalTime, gallery } = req.body;
      const dto = new UpdateTheaterDetailsDTO(id, location,facilities,intervalTime,gallery);
      const theater = await this.updateVendorDetailsUseCase.execute(dto);
      sendResponse(res, HttpResCode.OK, 'Theater details updated successfully.', theater);
    } catch (error) {
      const errorMessage = error instanceof CustomError ? error.message : ERROR_MESSAGES.DATABASE.RECORD_NOT_SAVED;
      sendResponse(res, HttpResCode.BAD_REQUEST, errorMessage);
    }
  }
  

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      if (!req.cookies) {
        sendResponse(
          res,
          HttpResCode.BAD_REQUEST,
          ERROR_MESSAGES.AUTHENTICATION.INVALID_REFRESH_TOKEN,
        );
        return;
      }
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        sendResponse(
          res,
          HttpResCode.BAD_REQUEST,
          ERROR_MESSAGES.AUTHENTICATION.INVALID_REFRESH_TOKEN,
        );
        return;
      }
      const jwtService = container.resolve<JwtService>('JwtService');
      const theaterRepository = container.resolve<IVendorRepository>('ITheaterRepository');
      const decoded = jwtService.verifyRefreshToken(refreshToken);
      const theater = await theaterRepository.findById(decoded.userId);
      if (!theater) {
        sendResponse(res, HttpResCode.NOT_FOUND, ERROR_MESSAGES.AUTHENTICATION.USER_NOT_FOUND);
        return;
      }
      const newAccessToken = jwtService.generateAccessToken(theater._id, theater.accountType);
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, { accessToken: newAccessToken });
    } catch (error) {
      const errorMessage =
        error instanceof CustomError
          ? error.message
          : ERROR_MESSAGES.AUTHENTICATION.INVALID_REFRESH_TOKEN;
      sendResponse(res, HttpResCode.BAD_REQUEST, errorMessage);
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
      const theater = await this.vendorRepository.findById(decoded.userId);
      if (!theater) {
        sendResponse(res, HttpResCode.NOT_FOUND, ERROR_MESSAGES.AUTHENTICATION.USER_NOT_FOUND);
        return;
      }
      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, {
        id: theater._id,
        name: theater.name,
        email: theater.email,
        phone: theater.phone || 0,
        profileImage: theater.gallery?.[0] || '',
      });
    } catch (error) {
      const errorMessage =
        error instanceof CustomError
          ? error.message
          : ERROR_MESSAGES.AUTHENTICATION.INVALID_ACCESS_TOKEN;
      sendResponse(res, HttpResCode.BAD_REQUEST, errorMessage);
    }
  }
}
