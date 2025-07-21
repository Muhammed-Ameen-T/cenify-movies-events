"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseError = void 0;
/**
 * Base error class for custom error handling.
 * Extends the built-in Error class and includes an HTTP status code.
 *
 * @extends {Error}
 */
class BaseError extends Error {
    /**
     * Constructs a new BaseError instance.
     *
     * @param {string} message - The error message to be displayed.
     * @param {number} statusCode - The HTTP status code associated with the error.
     */
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.BaseError = BaseError;
