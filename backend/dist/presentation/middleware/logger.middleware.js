"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = requestLogger;
const logger_utils_1 = __importDefault(require("../../utils/logger.utils"));
/**
 * Middleware to log incoming HTTP requests.
 * Captures and logs the request method and URL using the application's logger.
 *
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express function to proceed to the next middleware.
 */
function requestLogger(req, res, next) {
    logger_utils_1.default.info(`${req.method} ${req.url}`);
    console.log(req.headers);
    next();
}
