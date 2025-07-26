import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { sendResponse } from '../../utils/response/sendResponse.utils';
import { HttpResCode, HttpResMsg } from '../../utils/constants/httpResponseCode.utils';
import ERROR_MESSAGES from '../../utils/constants/commonErrorMsg.constants';
import { LoginAdminDTO } from '../../application/dtos/auth.dto';
import { IAdminAuthController } from './interface/adminAuth.controller.interface';
import { ILoginAdminUseCase } from '../../domain/interfaces/useCases/Admin/adminLogin.interface';

/**
 * Controller for handling admin authentication related requests.
 * @implements {IAdminAuthController}
 */
@injectable()
export class AdminAuthController implements IAdminAuthController {
  /**
   * Creates an instance of AdminAuthController.
   * @param {ILoginAdminUseCase} loginAdminUseCase - The use case for admin login.
   */
  constructor(@inject('LoginAdminUseCase') private loginAdminUseCase: ILoginAdminUseCase) {}

  /**
   * Handles the admin login request.
   * @param {Request} req - The express request object.
   * @param {Response} res - The express response object.
   * @param {NextFunction} next - The express next middleware function.
   * @returns {Promise<void>}
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      const dto: LoginAdminDTO = { email, password };
      const result = await this.loginAdminUseCase.execute(dto);

      console.log('Admin Login Success!');

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: parseInt(process.env.ADMIN_MAX_AGE || '0', 10),
      });

      sendResponse(res, HttpResCode.OK, HttpResMsg.CREATED, {
        accessToken: result.accessToken,
        user: result.user,
      });
    } catch (error) {
      next(error);
    }
  }
}
