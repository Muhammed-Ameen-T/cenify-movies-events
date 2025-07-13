import { Request, Response, NextFunction } from 'express';
import logger from '../../utils/logger.utils';
import { HttpResCode, HttpResMsg } from '../../utils/constants/httpResponseCode.utils';
import { BaseError } from '../../utils/errors/base.error';
import { sendResponse } from '../../utils/response/sendResponse.utils';

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  logger.error(`${err.message} "${req.originalUrl}"`, err.stack);

  if (err instanceof BaseError) {
    sendResponse(res, err.statusCode, err.message);
  } else {
    sendResponse(
      res,
      HttpResCode.INTERNAL_SERVER_ERROR,
      err.message || HttpResMsg.SOMETHING_WENT_WRONG
    );
  }
};

export default errorHandler;

  // Clear cookie In case of an UnAuthorized Access
  // if (
  //   err.message === HttpResMsg.REFRESH_TOKEN_REQUIRED ||
  //   err.message === HttpResMsg.INVALID_OR_EXPIRED_REFRESH_TOKEN
  // ) {
  //   res.clearCookie('refreshToken');
  // }