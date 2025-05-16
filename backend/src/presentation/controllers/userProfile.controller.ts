// src/presentation/controllers/auth.controller.ts
import 'reflect-metadata';
import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { container } from 'tsyringe';

import { sendResponse } from '../../utils/response/sendResponse.utils';
import { HttpResCode, HttpResMsg } from '../../utils/constants/httpResponseCode.utils';
import ERROR_MESSAGES from '../../utils/constants/commonErrorMsg.constants';
import { CustomError } from '../../utils/errors/custom.error';
import { JwtService } from '../../infrastructure/services/jwt.service';
import { IgetUserDetailsUseCase } from '../../domain/interfaces/useCases/User/getUserDetails.interface';
import { IupdateUserProfileUseCase } from '../../domain/interfaces/useCases/User/updateUserProfile.interface';
import { UpdateProfileRequestDTO } from '../../application/dtos/user.dto';
import { IUserProfileController } from './interface/userProfile.controller.interface';

@injectable()
export class UserProfileController implements IUserProfileController {
  constructor(
    @inject('GetUserDetailsUseCase') private getUserDetailsUseCase: IgetUserDetailsUseCase,
    @inject('UpdateUserProfileUseCase') private updateUserDetailsUseCase: IupdateUserProfileUseCase,
  ) {}

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
  async updateUserProfile(req: Request, res: Response): Promise<void> {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      sendResponse(res, HttpResCode.UNAUTHORIZED, ERROR_MESSAGES.AUTHENTICATION.UNAUTHORIZED);
      return;
    }   

    try {
    console.log("🚀 ~ UserProfileController ~ updateUserProfile ~ req.body:", req.body) 
      const jwtService = container.resolve<JwtService>('JwtService');
      const decoded = jwtService.verifyAccessToken(token);

      const updateData = new UpdateProfileRequestDTO(
        req.body.name,
        req.body.phone !== undefined ? Number(req.body.phone) : undefined,
        req.body.profileImage,
        req.body.dob=='N/A' ? null : new Date(req.body.dob),
      );

      const userResponse = await this.updateUserDetailsUseCase.execute(decoded.userId, updateData);

      sendResponse(res, HttpResCode.OK, HttpResMsg.SUCCESS, {userResponse});
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : ERROR_MESSAGES.GENERAL.FAILED_UPDATING_PROFILE;
      console.error('updateUserProfile error:', errorMessage);
      const statusCode =
        error instanceof CustomError ? error.statusCode : HttpResCode.BAD_REQUEST;
      sendResponse(res, statusCode, errorMessage);
    }
  }
}