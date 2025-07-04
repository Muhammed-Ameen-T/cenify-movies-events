import { Request, Response, NextFunction } from 'express';
import logger from '../../utils/logger.utils';

/**
 * Middleware to log incoming HTTP requests.
 * Captures and logs the request method and URL using the application's logger.
 *
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express function to proceed to the next middleware.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  logger.info(`${req.method} ${req.url}`);
  console.log(req.headers);
  next();
}
