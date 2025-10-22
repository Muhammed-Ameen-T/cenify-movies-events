import 'reflect-metadata';
import { NextFunction, Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { sendResponse } from '../../utils/response/sendResponse.utils';
import { HttpResCode } from '../../utils/constants/httpResponseCode.utils';
import {
  SendOtpVendorDTO,
  VerifyOtpVendorDTO,
  LoginVendorDTO,
  TheaterDetailsDTO,
} from '../../application/dtos/vendor.dto';
import { IVendorAuthController } from './interface/vendorAuth.controller.interface';
import { ISendOtpVendorUseCase } from '../../domain/interfaces/useCases/Vendor/sendOtpVendor.interface';
import { IVerifyOtpVendorUseCase } from '../../domain/interfaces/useCases/Vendor/verifyOtpVendor.interface';
import { ILoginVendorUseCase } from '../../domain/interfaces/useCases/Vendor/loginVendor.interface';
import { ICreateNewTheaterUseCase } from '../../domain/interfaces/useCases/Vendor/createNewTheater.interface';
import { SuccessMsg } from '../../utils/constants/commonSuccessMsg.constants';

/**
 * Controller for handling vendor (theater owner) authentication and basic theater management operations.
 * @implements {IVendorAuthController}
 */
@injectable()
export class VendorAuthController implements IVendorAuthController {
  /**
   * Constructs an instance of VendorAuthController.
   * @param {ISendOtpVendorUseCase} _sendOtpUseCase - Use case for sending OTP to a vendor's email.
   * @param {IVerifyOtpVendorUseCase} _verifyOtpUseCase - Use case for verifying OTP and registering a new vendor.
   * @param {ILoginVendorUseCase} _loginVendorUseCase - Use case for logging in a vendor.
   * @param {ICreateNewTheaterUseCase} _createTheaterUseCase - Use case for creating a new theater by a logged-in vendor.
   */
  constructor(
    @inject('SendOtpVendorUseCase') private _sendOtpUseCase: ISendOtpVendorUseCase,
    @inject('VerifyOtpVendorUseCase') private _verifyOtpUseCase: IVerifyOtpVendorUseCase,
    @inject('LoginVendorUseCase') private _loginVendorUseCase: ILoginVendorUseCase,
    @inject('CreateTheaterUseCase') private _createTheaterUseCase: ICreateNewTheaterUseCase,
  ) {}

  /**
   * Sends a one-time password (OTP) to the provided vendor email for registration/verification purposes.
   * @param {Request} req - The Express request object, containing `email` in `req.body`.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   * @returns {Promise<void>}
   */
  async sendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      const dto = new SendOtpVendorDTO(email);
      dto.email = email.trim();
      await this._sendOtpUseCase.execute(dto);
      sendResponse(res, HttpResCode.OK, 'OTP sent successfully.');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verifies the OTP and registers the new vendor if the OTP is valid.
   * @param {Request} req - The Express request object, containing `name`, `email`, `password`, `phone`, and `otp` in `req.body`.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   * @returns {Promise<void>}
   */
  async verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password, phone, otp } = req.body;
      const dto = new VerifyOtpVendorDTO(name, email, password, phone, otp);
      const result = await this._verifyOtpUseCase.execute(dto);

      sendResponse(res, HttpResCode.OK, SuccessMsg.USER_REGISTERED, {
        accessToken: result.accessToken,
        user: result.user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logs in a vendor using email and password, and sets an HTTP-only refresh token cookie.
   * @param {Request} req - The Express request object, containing `email` and `password` in `req.body`.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   * @returns {Promise<void>}
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const dto = new LoginVendorDTO(email, password);
      const result = await this._loginVendorUseCase.execute(dto);
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: parseInt(process.env.ADMIN_MAX_AGE || '0', 10),
      });
      sendResponse(res, HttpResCode.OK, SuccessMsg.USER_LOGGED_IN, {
        accessToken: result.accessToken,
        user: result.user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Creates a new theater associated with the logged-in vendor.
   * Requires vendor ID from the decoded JWT token (`req.decoded?.userId`).
   * @param {Request} req - The Express request object. `req.decoded?.userId` must contain the vendor ID.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   * @returns {Promise<void>}
   */
  async createNewTheater(req: Request, res: Response, next: NextFunction): Promise<void> {
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
      const theater = await this._createTheaterUseCase.execute(dto);
      sendResponse(res, HttpResCode.OK, 'Theater details updated successfully.', theater);
    } catch (error) {
      next(error);
    }
  }
}