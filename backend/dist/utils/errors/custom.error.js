"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomError = void 0;
const base_error_1 = require("./base.error");
/**
 * Custom error class extending the BaseError class.
 * Allows defining custom error messages with a status code.
 *
 * @extends {BaseError}
 */
class CustomError extends base_error_1.BaseError {
    /**
     * Constructs a new CustomError instance.
     *
     * @param {string} message - The error message to be displayed.
     * @param {number} [statusCode=400] - The HTTP status code (default: 400).
     */
    constructor(message, statusCode = 400) {
        super(message, statusCode);
    }
}
exports.CustomError = CustomError;
