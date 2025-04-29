import { Request, Response } from 'express';
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

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      console.log('AdminAuthController.Login: Received request:', { email, password });

      const dto: LoginAdminDTO = { email, password };
      const result = await this.loginAdminUseCase.execute(dto);

      console.log('Admin Login Success!');

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      sendResponse(res, HttpResCode.OK, HttpResMsg.CREATED, {
        accessToken: result.accessToken,
        user: result.user,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to verify OTP.';
      console.error('AdminAuthController.verifyOtp error:', error);
      sendResponse(res, HttpResCode.INTERNAL_SERVER_ERROR, errorMessage);
    }
  }
}
