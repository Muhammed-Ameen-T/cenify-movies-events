"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
/**
 * Middleware to authenticate users using JWT.
 * Extracts and verifies the access token from the request headers.
 * Attaches the user's ID to the request object if validation is successful.
 *
 * @param {JwtService} jwtService - Instance of JwtService to handle token verification.
 * @returns {RequestHandler} Express middleware function for authentication.
 */
const authMiddleware = (jwtService) => {
    return (req, res, next) => {
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
        }
        catch (error) {
            // Respond with unauthorized status if token validation fails
            res.status(401).json({ message: 'Invalid token' });
        }
    };
};
exports.authMiddleware = authMiddleware;
