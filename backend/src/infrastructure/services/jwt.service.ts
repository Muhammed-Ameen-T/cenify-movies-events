import * as jwt from 'jsonwebtoken';
import { env } from '../../config/env.config';

export class JwtService {
  private accessSecret: string = env.ACCESS_TOKEN_SECRET;
  private refreshSecret: string = env.REFRESH_TOKEN_SECRET;
  private accessExpiry: string = env.ACCESS_TOKEN_EXPIRY;
  private refreshExpiry: string = env.REFRESH_TOKEN_EXPIRY;

  /**
   * Generates an access token for authentication.
   * @param {string} userId - The unique ID of the user.
   * @param {string} role - The role assigned to the user (e.g., admin, user).
   * @returns {string} A signed JWT access token.
   */
  generateAccessToken(userId: string, role: string): string {
    return jwt.sign({ userId, role }, this.accessSecret, {
      expiresIn: this.accessExpiry as jwt.SignOptions['expiresIn'],
    });
  }

  /**
   * Generates a refresh token for session renewal.
   * @param {string} userId - The unique ID of the user.
   * @param {string} role - The role assigned to the user.
   * @returns {string} A signed JWT refresh token.
   */
  generateRefreshToken(userId: string, role: string): string {
    return jwt.sign({ userId, role }, this.refreshSecret, {
      expiresIn: this.refreshExpiry as jwt.SignOptions['expiresIn'],
    });
  }

  /**
   * Verifies and decodes an access token.
   * @param {string} token - The JWT access token to verify.
   * @returns {{ userId: string }} The decoded payload containing the user's ID.
   * @throws {jwt.JsonWebTokenError} If the token is invalid or expired.
   */
  verifyAccessToken(token: string): { userId: string } {
    return jwt.verify(token, this.accessSecret) as { userId: string };
  }

  /**
   * Verifies and decodes a refresh token.
   * @param {string} token - The JWT refresh token to verify.
   * @returns {{ userId: string }} The decoded payload containing the user's ID.
   * @throws {jwt.JsonWebTokenError} If the token is invalid or expired.
   */
  verifyRefreshToken(token: string): { userId: string } {
    return jwt.verify(token, this.refreshSecret) as { userId: string };
  }
}
