import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../../utils/errors/custom.error';
import { HttpResCode, HttpResMsg } from '../../utils/constants/httpResponseCode.utils';
import { IUserRepository } from '../../domain/interfaces/repositories/user.repository';
import { container } from 'tsyringe';
import { sendResponse } from '../../utils/response/sendResponse.utils';

export const authorizeRoles = (roles: Array<'user' | 'vendor' | 'admin'>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const decoded = req.decoded;

      if (!decoded) {
        throw new CustomError(HttpResMsg.UNAUTHORIZED, HttpResCode.UNAUTHORIZED);
      }

      if (!roles.includes(decoded.role)) {
        throw new CustomError(HttpResMsg.FORBIDDEN, HttpResCode.FORBIDDEN);
      }

      const userRepository = container.resolve<IUserRepository>('IUserRepository');
      const user = await userRepository.findById(decoded.userId);

      if (!user) {
        sendResponse(res, HttpResCode.UNAUTHORIZED, HttpResMsg.USER_NOT_FOUND);
      }

      if (user?.isBlocked) {
        sendResponse(res, HttpResCode.FORBIDDEN, HttpResMsg.USER_BLOCKED);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
