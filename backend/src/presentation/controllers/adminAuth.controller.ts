import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { sendResponse } from '../../utils/response/sendResponse.utils';
import { HttpResCode, HttpResMsg } from '../../utils/constants/httpResponseCode.utils';
import ERROR_MESSAGES from '../../utils/constants/commonErrorMsg.constants';
import { LoginAdminDTO } from '../../application/dtos/auth.dto';
import { IAdminAuthController } from './interface/adminAuth.controller.interface';
import { ILoginAdminUseCase } from '../../domain/interfaces/useCases/Admin/adminLogin.interface';

@injectable()
export class AdminAuthController implements IAdminAuthController {
  constructor(@inject('LoginAdminUseCase') private loginAdminUseCase: ILoginAdminUseCase) {}

  async login(req: Request, res: Response, next:NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      const dto: LoginAdminDTO = { email, password };
      const result = await this.loginAdminUseCase.execute(dto);

      console.log('Admin Login Success!');

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000,
      });

      sendResponse(res, HttpResCode.OK, HttpResMsg.CREATED, {
        accessToken: result.accessToken,
        user: result.user,
      });
    } catch (error) {
      next(error)
    }
  }
}
