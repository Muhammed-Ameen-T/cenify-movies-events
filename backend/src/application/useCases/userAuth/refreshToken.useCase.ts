// src/application/usecases/auth/refreshToken.usecase.ts
import { container, inject, injectable } from 'tsyringe';
import { IRefreshTokenUseCase } from '../../../domain/interfaces/useCases/User/refreshToken.interface';
import { JwtService } from '../../../infrastructure/services/jwt.service';
import { IUserRepository } from '../../../domain/interfaces/repositories/user.repository';
import { CustomError } from '../../../utils/errors/custom.error';
import ERROR_MESSAGES from '../../../utils/constants/commonErrorMsg.constants';
import { HttpResCode } from '../../../utils/constants/httpResponseCode.utils';
import jwt from 'jsonwebtoken';

@injectable()
export class RefreshTokenUseCase implements IRefreshTokenUseCase {
  constructor(@inject('IUserRepository') private userRepository: IUserRepository) {}

  async execute(refreshToken: string): Promise<string> {
    if (!refreshToken) {
      throw new CustomError(
        ERROR_MESSAGES.AUTHENTICATION.INVALID_REFRESH_TOKEN,
        HttpResCode.UNAUTHORIZED,
      );
    }

    const decoded = jwt.decode(refreshToken) as jwt.JwtPayload;

    if (!decoded || !decoded.exp || Date.now() >= decoded.exp * 1000) {
      throw new CustomError(
        ERROR_MESSAGES.AUTHENTICATION.INVALID_REFRESH_TOKEN,
        HttpResCode.UNAUTHORIZED,
      );
    }
    const jwtService = container.resolve<JwtService>('JwtService');

    const verifiedDecoded = jwtService.verifyRefreshToken(refreshToken);

    const user = await this.userRepository.findById(verifiedDecoded.userId);

    if (!user) {
      throw new CustomError(ERROR_MESSAGES.AUTHENTICATION.USER_NOT_FOUND, HttpResCode.NOT_FOUND);
    }

    const newAccessToken = jwtService.generateAccessToken(user._id.toString(), user.role);

    return newAccessToken;
  }
}
