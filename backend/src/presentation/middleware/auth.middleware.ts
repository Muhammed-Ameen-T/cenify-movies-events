import { Request, Response, NextFunction, RequestHandler } from 'express';
import { JwtService } from '../../infrastructure/services/jwt.service';

// Extend Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}

/**
 * Middleware to authenticate users using JWT.
 * Extracts and verifies the access token from the request headers.
 * Attaches the user's ID to the request object if validation is successful.
 *
 * @param {JwtService} jwtService - Instance of JwtService to handle token verification.
 * @returns {RequestHandler} Express middleware function for authentication.
 */
export const authMiddleware = (jwtService: JwtService): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const token = req.headers.authorization?.split(' ')[1];

    // If no token is provided, deny access
    if (!token) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    try {
      // Verify token and attach user ID to request
      const decoded = jwtService.verifyAccessToken(token);
      req.user = { id: decoded.userId };
      next();
    } catch (error) {
      // Respond with unauthorized status if token validation fails
      res.status(401).json({ message: 'Invalid token' });
    }
  };
};
