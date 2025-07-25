import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { HttpResCode } from '../../utils/constants/httpResponseCode.utils';
import { sendResponse } from '../../utils/response/sendResponse.utils';

/**
 * Middleware to validate request body using Zod schema.
 * If validation fails, it responds with an unauthorized error.
 *
 * @param {ZodSchema<any>} schema - The Zod schema used for validation.
 * @returns {(req: Request, res: Response, next: NextFunction) => void} Express middleware function.
 */
export const validateRequest =
  (schema: ZodSchema<any>) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    // If validation fails, format error messages and send response
    if (!result.success) {
      const errorMessage = result.error.errors
        .map((err) => `${err.path.join('.')}: ${err.message}`)
        .join(', ');
      sendResponse(res, HttpResCode.UNAUTHORIZED, errorMessage);
      return;
    }

    next();
  };
