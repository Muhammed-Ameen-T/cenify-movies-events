import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import jwt from 'jsonwebtoken';
import { IJwtDecoded } from '../../domain/interfaces/repositories/jwtDecode.repository';
import { CustomError } from '../../utils/errors/custom.error';
import { HttpResCode, HttpResMsg } from '../../utils/constants/httpResponseCode.utils';
import { env } from '../../config/env.config';
import { JwtService } from '../../infrastructure/services/jwt.service';
import { IAuthRepository } from '../../domain/interfaces/repositories/userAuth.types';

const jwtService = container.resolve<JwtService>('JwtService'); 

declare global {
  namespace Express {
    interface Request {
      decoded?: IJwtDecoded;
    }
  }
}

/**
 * Middleware to verify the access token from the request headers.
 * If the access token is expired, attempts to refresh it using the refresh token.
 * Attaches the decoded user information to `req.decoded` for further use in routes.
 * 
 * @param {Request} req - Express request object containing authorization header
 * @param {Response} res - Express response object for setting headers or returning errors
 * @param {NextFunction} next - Express next function to proceed to the next middleware or route handler
 */
export const verifyAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract access token from Authorization header
    console.log('verifyAccessToken: Cookies received:', req.cookies);
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.startsWith('Bearer ') 
      ? authHeader.split(' ')[1] 
      : null;

    if (!accessToken) {
      throw new CustomError(
        HttpResMsg.NO_ACCESS_TOKEN,
        HttpResCode.UNAUTHORIZED
      );
    }

    try {
      // Verify access token
      const decoded = jwt.verify(
        accessToken,
        env.ACCESS_TOKEN_SECRET
      ) as IJwtDecoded;

      // Attach decoded user data to request
      req.decoded = decoded;
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        // Handle expired access token
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
          throw new CustomError(
            HttpResMsg.REFRESH_TOKEN_REQUIRED,
            HttpResCode.UNAUTHORIZED
          );
        }

        try {
          // Verify refresh token
          const decodedRefresh = jwt.verify(
            refreshToken,
            env.REFRESH_TOKEN_SECRET
          ) as IJwtDecoded;

          // Fetch user details from the repository
          const authRepository = container.resolve<IAuthRepository>('AuthRepository');
          const user = await authRepository.findByEmail(decodedRefresh.email);

          if (!user) {
            throw new CustomError(
              HttpResMsg.USER_NOT_FOUND,
              HttpResCode.UNAUTHORIZED
            );
          }

          // Check if user is blocked
          if (user.isBlocked) {
            throw new CustomError(
              HttpResMsg.USER_BLOCKED,
              HttpResCode.FORBIDDEN
            );
          }

          // Generate new access token
          const newAccessToken = jwtService.generateAccessToken(user._id.toString(), user.role);

          // Set new access token in response header
          res.setHeader('x-access-token', newAccessToken);

          req.decoded = decodedRefresh;
          next();
        } catch (refreshError) {
          if (error instanceof jwt.TokenExpiredError) {
            console.log('Refresh token expired');
          }else{
            console.log('Invalid refresh token');
          }

          throw new CustomError(
            HttpResMsg.INVALID_OR_EXPIRED_REFRESH_TOKEN,
            HttpResCode.UNAUTHORIZED
          );
        }
      } else {
        throw new CustomError(
          HttpResMsg.INVALID_ACCESS_TOKEN,
          HttpResCode.UNAUTHORIZED
        );
      }
    }
  } catch (error) {
    next(error);
  }
};