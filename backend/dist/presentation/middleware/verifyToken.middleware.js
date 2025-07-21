"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAccessToken = void 0;
const tsyringe_1 = require("tsyringe");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const custom_error_1 = require("../../utils/errors/custom.error");
const httpResponseCode_utils_1 = require("../../utils/constants/httpResponseCode.utils");
const env_config_1 = require("../../config/env.config");
const jwtService = tsyringe_1.container.resolve('JwtService');
const verifyAccessToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const accessToken = authHeader?.split(' ')[1];
        if (!accessToken) {
            throw new custom_error_1.CustomError(httpResponseCode_utils_1.HttpResMsg.NO_ACCESS_TOKEN, httpResponseCode_utils_1.HttpResCode.UNAUTHORIZED);
        }
        try {
            // Verify access token
            const decoded = jsonwebtoken_1.default.verify(accessToken, env_config_1.env.ACCESS_TOKEN_SECRET);
            req.decoded = decoded;
            next();
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                const refreshToken = req.cookies.refreshToken;
                if (!refreshToken) {
                    throw new custom_error_1.CustomError(httpResponseCode_utils_1.HttpResMsg.REFRESH_TOKEN_REQUIRED, httpResponseCode_utils_1.HttpResCode.UNAUTHORIZED);
                }
                try {
                    // Verify refresh token
                    const decodedRefresh = jsonwebtoken_1.default.verify(refreshToken, env_config_1.env.REFRESH_TOKEN_SECRET);
                    // Fetch user details from the repository
                    const userRepository = tsyringe_1.container.resolve('IUserRepository');
                    const user = await userRepository.findById(decodedRefresh.userId);
                    if (!user) {
                        throw new custom_error_1.CustomError(httpResponseCode_utils_1.HttpResMsg.USER_NOT_FOUND, httpResponseCode_utils_1.HttpResCode.UNAUTHORIZED);
                    }
                    if (user.isBlocked) {
                        throw new custom_error_1.CustomError(httpResponseCode_utils_1.HttpResMsg.USER_BLOCKED, httpResponseCode_utils_1.HttpResCode.FORBIDDEN);
                    }
                    // Generate new access token with userId and role
                    const newAccessToken = jwtService.generateAccessToken(user._id.toString(), user.role);
                    // Set new access token in response header
                    res.setHeader('x-access-token', newAccessToken);
                    req.decoded = decodedRefresh;
                    next();
                }
                catch (refreshError) {
                    console.error('Refresh token error:', refreshError);
                    throw new custom_error_1.CustomError(httpResponseCode_utils_1.HttpResMsg.INVALID_OR_EXPIRED_REFRESH_TOKEN, httpResponseCode_utils_1.HttpResCode.UNAUTHORIZED);
                }
            }
            else {
                throw new custom_error_1.CustomError(httpResponseCode_utils_1.HttpResMsg.INVALID_ACCESS_TOKEN, httpResponseCode_utils_1.HttpResCode.UNAUTHORIZED);
            }
        }
    }
    catch (error) {
        next(error);
    }
};
exports.verifyAccessToken = verifyAccessToken;
