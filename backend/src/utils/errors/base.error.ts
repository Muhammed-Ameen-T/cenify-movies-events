/**
 * Base error class for custom error handling.
 * Extends the built-in Error class and includes an HTTP status code.
 *
 * @extends {Error}
 */
export class BaseError extends Error {
  public statusCode: number;

  /**
   * Constructs a new BaseError instance.
   *
   * @param {string} message - The error message to be displayed.
   * @param {number} statusCode - The HTTP status code associated with the error.
   */
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;

    Error.captureStackTrace(this, this.constructor);
  }
}
