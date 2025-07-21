"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = void 0;
const custom_error_1 = require("../../utils/errors/custom.error");
const httpResponseCode_utils_1 = require("../../utils/constants/httpResponseCode.utils");
const tsyringe_1 = require("tsyringe");
const sendResponse_utils_1 = require("../../utils/response/sendResponse.utils");
const authorizeRoles = (roles) => {
    return async (req, res, next) => {
        try {
            const decoded = req.decoded;
            if (!decoded) {
                throw new custom_error_1.CustomError(httpResponseCode_utils_1.HttpResMsg.UNAUTHORIZED, httpResponseCode_utils_1.HttpResCode.UNAUTHORIZED);
            }
            if (!roles.includes(decoded.role)) {
                throw new custom_error_1.CustomError(httpResponseCode_utils_1.HttpResMsg.FORBIDDEN, httpResponseCode_utils_1.HttpResCode.FORBIDDEN);
            }
            const userRepository = tsyringe_1.container.resolve('IUserRepository');
            const user = await userRepository.findById(decoded.userId);
            if (!user) {
                (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.UNAUTHORIZED, httpResponseCode_utils_1.HttpResMsg.USER_NOT_FOUND);
            }
            if (user?.isBlocked) {
                (0, sendResponse_utils_1.sendResponse)(res, httpResponseCode_utils_1.HttpResCode.FORBIDDEN, httpResponseCode_utils_1.HttpResMsg.USER_BLOCKED);
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.authorizeRoles = authorizeRoles;
