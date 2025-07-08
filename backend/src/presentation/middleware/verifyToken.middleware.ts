import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import jwt from 'jsonwebtoken';
import { IJwtDecoded } from '../../domain/interfaces/repositories/jwtDecode.repository';
import { CustomError } from '../../utils/errors/custom.error';
import { HttpResCode, HttpResMsg } from '../../utils/constants/httpResponseCode.utils';
import { env } from '../../config/env.config';
import { JwtService } from '../../infrastructure/services/jwt.service';
import { IAuthRepository } from '../../domain/interfaces/repositories/userAuth.types';
import { IUserRepository } from '../../domain/interfaces/repositories/user.repository';

const jwtService = container.resolve<JwtService>('JwtService');

declare global {
  namespace Express {
    interface Request {
      decoded?: IJwtDecoded;
    }
  }
}

export const verifyAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.split(' ')[1];

    if (!accessToken) {
      throw new CustomError(HttpResMsg.NO_ACCESS_TOKEN, HttpResCode.UNAUTHORIZED);
    }

    try {
      // Verify access token
      const decoded = jwt.verify(accessToken, env.ACCESS_TOKEN_SECRET) as IJwtDecoded;

      req.decoded = decoded;
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
          throw new CustomError(HttpResMsg.REFRESH_TOKEN_REQUIRED, HttpResCode.UNAUTHORIZED);
        }

        try {
          // Verify refresh token
          const decodedRefresh = jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET) as IJwtDecoded;

          // Fetch user details from the repository
          const userRepository = container.resolve<IUserRepository>('IUserRepository');
          const user = await userRepository.findById(decodedRefresh.userId);

          if (!user) {
            throw new CustomError(HttpResMsg.USER_NOT_FOUND, HttpResCode.UNAUTHORIZED);
          }

          if (user.isBlocked) {
            throw new CustomError(HttpResMsg.USER_BLOCKED, HttpResCode.FORBIDDEN);
          }

          // Generate new access token with userId and role
          const newAccessToken = jwtService.generateAccessToken(user._id.toString(), user.role);

          // Set new access token in response header
          res.setHeader('x-access-token', newAccessToken);

          req.decoded = decodedRefresh;
          next();
        } catch (refreshError) {
          console.error('Refresh token error:', refreshError);
          throw new CustomError(
            HttpResMsg.INVALID_OR_EXPIRED_REFRESH_TOKEN,
            HttpResCode.UNAUTHORIZED,
          );
        }
      } else {
        throw new CustomError(HttpResMsg.INVALID_ACCESS_TOKEN, HttpResCode.UNAUTHORIZED);
      }
    }
  } catch (error) {
    next(error);
  }
};
