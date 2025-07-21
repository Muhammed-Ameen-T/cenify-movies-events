"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_utils_1 = __importDefault(require("../../utils/logger.utils"));
const httpResponseCode_utils_1 = require("../../utils/constants/httpResponseCode.utils");
const base_error_1 = require("../../utils/errors/base.error");
const sendResponse_utils_1 = require("../../utils/response/sendResponse.utils");
const errorHandler = (err, req, res, next) => {
    logger_utils_1.default.error(`${err.message} "${req.originalUrl}"`, err.stack);
    if (err instanceof base_error_1.BaseError) {
        (0, sendResponse_utils_1.sendResponse)(res, err.statusCode, err.message);
    }
    else {
        (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.INTERNAL_SERVER_ERROR, err.message || httpResponseCode_utils_1.HttpResMsg.SOMETHING_WENT_WRONG);
    }
};
exports.default = errorHandler;
// Clear cookie In case of an UnAuthorized Access
// if (
//   err.message === HttpResMsg.REFRESH_TOKEN_REQUIRED ||
//   err.message === HttpResMsg.INVALID_OR_EXPIRED_REFRESH_TOKEN
// ) {
//   res.clearCookie('refreshToken');
// }
