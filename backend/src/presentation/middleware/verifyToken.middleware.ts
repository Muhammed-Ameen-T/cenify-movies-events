import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import jwt from 'jsonwebtoken';
import { IJwtDecoded } from '../../domain/interfaces/repositories/jwtDecode.repository';
import { CustomError } from '../../utils/errors/custome.error';
import { HttpResCode } from '../../utils/constants/httpResponseCode.utils';
import { env } from '../../config/env.config';
import { IAuthRepository } from '../../domain/interfaces/repositories/userAuth.types';
import logger from '../../utils/logger.utils';

declare global {
  namespace Express {
    interface Request {
      decoded?: IJwtDecoded;
    }
  }
}

/**
 * Middleware to verify JWT access tokens and refresh tokens.
 * Attaches the decoded user data to the request object upon successful verification.
 *
 * @param {Request} req - Express request object containing the authorization header.
 * @param {Response} res - Express response object used to return errors or new tokens.
 * @param {NextFunction} next - Express function to proceed to the next middleware.
 * @throws {CustomError} If no token is provided, the token is invalid, or user is not found.
 */
export const verifyAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new CustomError('Access denied. No token provided.', HttpResCode.UNAUTHORIZED);
    }

    const accessToken = authHeader.split(' ')[1];

    try {
      // Verify access token
      const decoded = jwt.verify(accessToken, env.ACCESS_TOKEN_SECRET) as IJwtDecoded;
      req.decoded = decoded;
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        // Handle expired access token
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
          throw new CustomError('Refresh token required.', HttpResCode.UNAUTHORIZED);
        }

        try {
          // Verify refresh token
          const decodedRefresh = jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET) as IJwtDecoded;

          const authRepository = container.resolve<IAuthRepository>('AuthRepository');
          const user = await authRepository.findById(decodedRefresh.userId);

          if (!user) {
            throw new CustomError('User not found.', HttpResCode.UNAUTHORIZED);
          }

          // Generate new access token (move to use case if possible)
          const newAccessToken = jwt.sign(
            { userId: user._id.toString(), email: user.email },
            env.ACCESS_TOKEN_SECRET,
            { expiresIn: parseInt(env.ACCESS_TOKEN_EXPIRY, 10) },
          );

          // Set new access token in response header (securely)
          res.setHeader('x-access-token', newAccessToken);

          req.decoded = { userId: user._id.toString(), email: user.email };
          next();
        } catch (refreshError) {
          logger.error('Refresh token verification failed:', refreshError); // Log error
          throw new CustomError('Invalid or expired refresh token.', HttpResCode.UNAUTHORIZED);
        }
      } else {
        logger.error('Access token verification failed:', error); // Log error
        throw new CustomError('Invalid access token.', HttpResCode.UNAUTHORIZED);
      }
    }
  } catch (error) {
    logger.error('Authentication error:', error); // Log error
    next(error);
  }
};
