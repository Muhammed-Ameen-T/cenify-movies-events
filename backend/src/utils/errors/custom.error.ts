import { BaseError } from './base.error';

/**
 * Custom error class extending the BaseError class.
 * Allows defining custom error messages with a status code.
 *
 * @extends {BaseError}
 */
export class CustomError extends BaseError {
  /**
   * Constructs a new CustomError instance.
   *
   * @param {string} message - The error message to be displayed.
   * @param {number} [statusCode=400] - The HTTP status code (default: 400).
   */
  constructor(message: string, statusCode: number = 400) {
    super(message, statusCode);
  }
}
