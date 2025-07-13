// src/presentation/controllers/theaterAuth.controller.ts
import 'reflect-metadata';
import { NextFunction, Request, Response } from 'express';
import { injectable, inject, container } from 'tsyringe';

import { sendResponse } from '../../utils/response/sendResponse.utils';
import { HttpResCode, HttpResMsg } from '../../utils/constants/httpResponseCode.utils';
import ERROR_MESSAGES from '../../utils/constants/commonErrorMsg.constants';
import { CustomError } from '../../utils/errors/custom.error';

import {
  SendOtpVendorDTO,
  VerifyOtpVendorDTO,
  LoginVendorDTO,
  TheaterDetailsDTO,
  UpdateTheaterDetailsDTO,
} from '../../application/dtos/vendor.dto';
import { IVendorAuthController } from './interface/vendorAuth.controller.interface';

import { ISendOtpVendorUseCase } from '../../domain/interfaces/useCases/Vendor/sendOtpVendor.interface';
import { IVerifyOtpVendorUseCase } from '../../domain/interfaces/useCases/Vendor/verifyOtpVendor.interface';
import { ILoginVendorUseCase } from '../../domain/interfaces/useCases/Vendor/loginVendor.interface';
import { ICreateNewTheaterUseCase } from '../../domain/interfaces/useCases/Vendor/createNewTheater.interface';

import { ITheaterRepository } from '../../domain/interfaces/repositories/theater.repository';
import { JwtService } from '../../infrastructure/services/jwt.service';
import { SuccessMsg } from '../../utils/constants/commonSuccessMsg.constants';

@injectable()
export class VendorAuthController implements IVendorAuthController {
  constructor(
    @inject('SendOtpVendorUseCase') private sendOtpUseCase: ISendOtpVendorUseCase,
    @inject('VerifyOtpVendorUseCase') private verifyOtpUseCase: IVerifyOtpVendorUseCase,
    @inject('LoginVendorUseCase') private loginVendorUseCase: ILoginVendorUseCase,
    @inject('CreateTheaterUseCase') private createTheaterUseCase: ICreateNewTheaterUseCase,
    @inject('TheaterRepository') private vendorRepository: ITheaterRepository,
  ) {}

  async sendOtp(req: Request, res: Response, next:NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      const dto = new SendOtpVendorDTO(email);
      dto.email = email.trim();
      await this.sendOtpUseCase.execute(dto);
      sendResponse(res, HttpResCode.OK, 'OTP sent successfully.');
    } catch (error) {
      next(error)
    }
  }

  async verifyOtp(req: Request, res: Response, next:NextFunction): Promise<void> {
    try {
      const { name, email, password, phone, accountType, otp } = req.body;
      const dto = new VerifyOtpVendorDTO(name, email, password, phone, otp);
      const result = await this.verifyOtpUseCase.execute(dto);

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
      const dto = new LoginVendorDTO(email, password);
      const result = await this.loginVendorUseCase.execute(dto);
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000,
      });
      sendResponse(res, HttpResCode.OK, SuccessMsg.USER_LOGGED_IN, {
        accessToken: result.accessToken,
        user: result.user,
      });
    } catch (error) {
      next(error)
    }
  }

  async createNewTheater(req: Request, res: Response, next:NextFunction): Promise<void> {
    try {
      const vendorId = req.decoded?.userId;
      const { name, location, facilities, intervalTime, gallery, email, phone, description } =
        req.body;
      const dto = new TheaterDetailsDTO(
        name,
        location,
        facilities,
        intervalTime,
        gallery,
        email,
        phone,
        description,
        vendorId,
      );
      const theater = await this.createTheaterUseCase.execute(dto);
      sendResponse(res, HttpResCode.OK, 'Theater details updated successfully.', theater);
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
      next(error)
    }
  }
}
